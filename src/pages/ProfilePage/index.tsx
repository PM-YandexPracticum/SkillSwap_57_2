import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/shared/ui/Header/Header";
import { Footer } from "@/shared/ui/Footer/Footer";
import { Card } from "@/shared/ui/Card";
import defaultAvatar from "@/shared/assets/default.svg";
import { fetchSkills } from "@/api/skills";
import { fetchUsers } from "@/entities/user/model/usersSlice";
import { updateCurrentUser } from "@/entities/user/model/usersSlice";
import { updateAuthUser } from "@/features/auth/model/authSlice";
import { selectCurrentUser } from "@/features/auth/model/authSelectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getRegisteredItems,
  getProfileChanges,
  mergeById,
  saveProfileChanges,
} from "@/shared/lib/registrationStorage";
import type { Skill, User, City } from "@/shared/types";
import { ProfileMenu, type ProfileSection } from "./ui/ProfileMenu";
import { PersonalData } from "./ui/PersonalData";
import styles from "./ProfilePage.module.css";

const PROFILE_OVERRIDES_KEY = "skillswap_profile_overrides";

const sectionTitles: Record<
  Exclude<ProfileSection, "personal" | "favorites">,
  string
> = {
  requests: "Заявки",
  exchanges: "Мои обмены",
  skills: "Мои навыки",
};

const availableSections: ProfileSection[] = [
  "requests",
  "exchanges",
  "favorites",
  "skills",
  "personal",
];

function getSkillItem(skillId: string, skills: Skill[]) {
  return (
    skills.find((skill) => skill.id === skillId) ?? {
      id: skillId,
      title: skillId,
    }
  );
}

function readProfileOverrides(): Record<string, Partial<User>> {
  try {
    const json = localStorage.getItem(PROFILE_OVERRIDES_KEY);
    if (!json) return {};
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const authUser = useAppSelector(selectCurrentUser);
  const usersState = useAppSelector((state) => state.users);
  const [profileOverrides] = useState(readProfileOverrides);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isReferenceLoading, setIsReferenceLoading] = useState(true);
  const [referenceError, setReferenceError] = useState<string | null>(null);

  const users = useMemo(
    () => {
      const savedIds = new Set(getProfileChanges().map((user) => user.id));
      return usersState.items.map((user) => {
        const override = profileOverrides[user.id];
        return override && !savedIds.has(user.id) ? { ...user, ...override } : user;
      });
    },
    [profileOverrides, usersState.items],
  );

  const requestedSection = searchParams.get("section") as ProfileSection | null;
  const activeSection =
    requestedSection && availableSections.includes(requestedSection)
      ? requestedSection
      : "personal";

  useEffect(() => {
    if (usersState.status === "idle") {
      void dispatch(fetchUsers());
    }
  }, [dispatch, usersState.status]);

  useEffect(() => {
    let cancelled = false;

    async function loadReferenceData() {
      setIsReferenceLoading(true);
      setReferenceError(null);
      try {
        const [skillsData, citiesResponse] = await Promise.all([
          fetchSkills(),
          fetch("/db/cities.json"),
        ]);

        if (!citiesResponse.ok) throw new Error("Failed to load cities");

        const citiesData: City[] = await citiesResponse.json();
        const registeredSkills = getRegisteredItems().skills;

        if (!cancelled) {
          setSkills(mergeById(skillsData, registeredSkills));
          setCities(citiesData);
        }
      } catch {
        if (!cancelled)
          setReferenceError("Не удалось загрузить данные профиля.");
      } finally {
        if (!cancelled) setIsReferenceLoading(false);
      }
    }

    void loadReferenceData();

    return () => {
      cancelled = true;
    };
  }, []);

  const profileUser = useMemo(() => {
    if (!authUser?.id) return null;
    return users.find((user) => user.id === authUser.id) ??
      (authUser.id === 'demo-user' ? {
        id: authUser.id, name: authUser.name, email: authUser.email,
        avatar: null, aboutMe: '', gender: 'unspecified', city: '', birthDate: '',
        createdAt: new Date().toISOString(), likesCount: 0, likesCard: [], teach: [], learn: [],
      } satisfies User : null);
  }, [authUser, users]);

  const favoriteUsers = useMemo(
    () =>
      profileUser?.likesCard
        .map((favoriteId) => users.find((user) => user.id === favoriteId))
        .filter((user): user is User => Boolean(user)) ?? [],
    [profileUser, users],
  );

  const error = usersState.error ?? referenceError;
  const isProfileLoading =
    isReferenceLoading ||
    usersState.status === "idle" ||
    usersState.status === "loading";
  const hasProfileError =
    Boolean(error) || !authUser || (!isProfileLoading && !profileUser);

  function handleRemoveFavorite(userId: string) {
    if (!profileUser) return;
    const likesCard = profileUser.likesCard.filter((id) => id !== userId);
    save({ ...profileUser, likesCard });
  }

  function save(user: User, password?: string) {
    if (user.id !== authUser?.id) throw new Error('Не удалось определить текущего пользователя');
    saveProfileChanges(user, password);
    dispatch(updateCurrentUser(user));
    dispatch(updateAuthUser({ id: user.id, name: user.name, email: user.email }));
  }

  const renderSection = () => {
    if (activeSection === "personal") {
      if (profileUser)
        return (
          <PersonalData
            key={profileUser?.id ?? "personal-data"}
            value={profileUser}
            cities={cities}
            onSave={save}
          />
        );

      if (hasProfileError) {
        return (
          <section className={styles.placeholder}>
            {error ?? "Не удалось загрузить данные текущего пользователя."}
          </section>
        );
      }

      return (
        <section className={styles.placeholder}>
          Загружаем данные профиля...
        </section>
      );
    }

    if (activeSection === "favorites") {
      if (isProfileLoading) {
        return (
          <section className={styles.placeholder}>
            Загружаем избранное...
          </section>
        );
      }

      if (hasProfileError) {
        return (
          <section className={styles.placeholder}>
            {error ?? "Не удалось загрузить избранное текущего пользователя."}
          </section>
        );
      }

      return (
        <section className={styles.favorites}>
          <h1>Избранное</h1>
          {favoriteUsers.length > 0 ? (
            <div className={styles.favoritesGrid}>
              {favoriteUsers.map((user) => (
                <Card
                  key={user.id}
                  user={user}
                  teach={user.teach.map((skillId) =>
                    getSkillItem(skillId, skills),
                  )}
                  learn={user.learn.map((skillId) =>
                    getSkillItem(skillId, skills),
                  )}
                  isLiked
                  onLikeChange={(isLiked) => {
                    if (!isLiked) {
                      handleRemoveFavorite(user.id);
                    }
                  }}
                  onDetailsClick={() =>
                    navigate(`/skill/${user.teach[0] ?? user.id}`)
                  }
                />
              ))}
            </div>
          ) : (
            <p className={styles.emptyFavorites}>
              В избранном пока нет предложений.
            </p>
          )}
        </section>
      );
    }

    return (
      <section className={styles.placeholder}>
        <h1>{sectionTitles[activeSection]}</h1>
        <p>Раздел находится в разработке.</p>
      </section>
    );
  };

  const pageStyle = {
    "--profile-avatar": `url("${profileUser?.avatar ?? defaultAvatar}")`,
  } as CSSProperties;

  return (
    <div className={styles.page} style={pageStyle}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <ProfileMenu activeSection={activeSection} />
          {renderSection()}
        </div>
      </main>
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  );
}
