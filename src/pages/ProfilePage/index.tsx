import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/shared/ui/Header/Header";
import { Footer } from "@/shared/ui/Footer/Footer";
import { Card } from "@/shared/ui/Card";
import defaultAvatar from "@/shared/assets/default.svg";
import { fetchSkills } from "@/api/skills";
import {
  addRegisteredUser,
  fetchUsers,
} from "@/entities/user/model/usersSlice";
import { selectCurrentUser } from "@/features/auth/model/authSelectors";
import { login } from "@/features/auth/model/authSlice";
import {
  MOCK_USERS_KEY,
  saveAuthUser,
} from "@/features/auth/model/authUtils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getRegisteredItems,
  mergeById,
  readRegistrations,
  REGISTRATIONS_KEY,
} from "@/shared/lib/registrationStorage";
import type { Skill, User, City } from "@/shared/types";
import { ProfileMenu, type ProfileSection } from "./ui/ProfileMenu";
import {
  PersonalData,
  type PersonalDataSubmitValue,
  type PersonalDataValue,
} from "./ui/PersonalData";
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

function saveProfileOverride(userId: string, changes: Partial<User>) {
  try {
    const overrides = readProfileOverrides();
    overrides[userId] = { ...(overrides[userId] ?? {}), ...changes };
    localStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // localStorage может быть недоступен в приватном режиме или при ограничениях браузера.
  }
}

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const authUser = useAppSelector(selectCurrentUser);
  const usersState = useAppSelector((state) => state.users);
  const [profileOverrides, setProfileOverrides] =
    useState(readProfileOverrides);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isReferenceLoading, setIsReferenceLoading] = useState(true);
  const [referenceError, setReferenceError] = useState<string | null>(null);

  const users = useMemo(
    () =>
      usersState.items.map((user) => {
        const override = profileOverrides[user.id];
        return override ? { ...user, ...override } : user;
      }),
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
    return users.find((user) => user.id === authUser.id) ?? null;
  }, [authUser?.id, users]);

  const personalData = useMemo<PersonalDataValue | null>(() => {
    if (!profileUser) return null;

    return {
      email: profileUser.email,
      name: profileUser.name,
      birthDate: profileUser.birthDate,
      gender: profileUser.gender,
      city: profileUser.city,
      aboutMe: profileUser.aboutMe || "",
      avatarUrl: profileUser.avatar || defaultAvatar,
    };
  }, [profileUser]);

  const cityOptions = useMemo(
    () => cities.map((city) => ({ value: city.id, label: city.title })),
    [cities],
  );

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
    setProfileOverrides((current) => ({
      ...current,
      [profileUser.id]: { ...(current[profileUser.id] ?? {}), likesCard },
    }));
    saveProfileOverride(profileUser.id, { likesCard });
  }

  function saveUpdatedRegistration(updatedUser: User) {
    try {
      const registrations = readRegistrations();
      const index = registrations.findIndex(
        (record) => record.user.id === updatedUser.id,
      );
      if (index < 0) return;

      registrations[index] = {
        ...registrations[index],
        user: updatedUser,
      };
      localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations));
    } catch {
      // Изменения мок-пользователя сохраняются через profileOverrides.
    }
  }

  function saveUpdatedCredentials(updatedUser: User, newPassword?: string) {
    try {
      const raw = localStorage.getItem(MOCK_USERS_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const credentials = Array.isArray(parsed)
        ? (parsed as Array<{
            id: string;
            name: string;
            email: string;
            password: string;
          }>)
        : [];
      const index = credentials.findIndex((item) => item.id === updatedUser.id);

      if (index >= 0) {
        credentials[index] = {
          ...credentials[index],
          name: updatedUser.name,
          email: updatedUser.email,
          ...(newPassword ? { password: newPassword } : {}),
        };
      } else if (newPassword || updatedUser.id === "user_6") {
        credentials.push({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          password: newPassword ?? "Skillswap123",
        });
      }

      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(credentials));
    } catch {
      // Ошибка хранилища не должна блокировать сохранение формы в Redux.
    }
  }

  function updateProfile(changes: Partial<User>, newPassword?: string) {
    if (!profileUser) return;

    const updatedUser = { ...profileUser, ...changes };
    dispatch(addRegisteredUser(updatedUser));
    setProfileOverrides((current) => ({
      ...current,
      [updatedUser.id]: {
        ...(current[updatedUser.id] ?? {}),
        ...changes,
      },
    }));
    saveProfileOverride(updatedUser.id, changes);
    saveUpdatedRegistration(updatedUser);
    saveUpdatedCredentials(updatedUser, newPassword);

    const updatedAuthUser = saveAuthUser({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
    dispatch(
      login.fulfilled(updatedAuthUser, "profile-update", {
        email: updatedUser.email,
        password: "",
      }),
    );
  }

  function handlePersonalDataSave(value: PersonalDataSubmitValue) {
    const { newPassword, ...changes } = value;
    updateProfile(changes, newPassword);
  }

  function handleAvatarChange(avatarUrl: string) {
    if (!avatarUrl.startsWith("data:image/")) return;
    updateProfile({ avatar: avatarUrl });
  }

  const renderSection = () => {
    if (activeSection === "personal") {
      if (personalData)
        return (
          <PersonalData
            key={profileUser?.id ?? "personal-data"}
            value={personalData}
            cityOptions={cityOptions}
            onSave={handlePersonalDataSave}
            onAvatarChange={handleAvatarChange}
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
    "--profile-avatar": `url("${personalData?.avatarUrl ?? defaultAvatar}")`,
  } as CSSProperties;

  return (
    <div className={styles.page} style={pageStyle}>
      <Header/>
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
