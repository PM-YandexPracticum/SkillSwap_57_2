import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Title } from "@/shared/ui/Title";
import { RadioGroup } from "@/shared/ui/RadioGroup";
import type { RadioOption } from "@/shared/ui/RadioGroup";
import {
  SkillFilter,
  clearSkillFilter,
  selectSelectedSkillIds,
} from "@/shared/ui/FilterPanel/SkillFilter";
import { CityFilter } from "@/shared/ui/FilterPanel/CityFilter";
import { GenderFilter } from "@/shared/ui/FilterPanel/GenderFilter";
import type { GenderValue } from "@/shared/ui/FilterPanel/GenderFilter";
import { ClearFilterButton } from "@/shared/ui/FilterPanel/ClearFilterButton/ClearFilterButton";
import styles from "./FiltersPanel.module.css";

export type SkillDirection = "all" | "learn" | "teach";

export interface FiltersValue {
  direction: SkillDirection;
  skillIds: string[];
  gender: GenderValue;
  cityIds: string[];
}

export interface FiltersPanelProps {
  onChange?: (filters: FiltersValue) => void;
}

const DIRECTION_OPTIONS: RadioOption<SkillDirection>[] = [
  { label: "Всё", value: "all" },
  { label: "Хочу научиться", value: "learn" },
  { label: "Могу научить", value: "teach" },
];

export function FiltersPanel({ onChange }: FiltersPanelProps) {
  const dispatch = useAppDispatch();
  const selectedSkillIds = useAppSelector(selectSelectedSkillIds);
  const [direction, setDirection] = useState<SkillDirection>("all");
  const [gender, setGender] = useState<GenderValue>("any");
  const [cityIds, setCityIds] = useState<string[]>([]);
  const [cityFilterKey, setCityFilterKey] = useState(0);

  const selectedCount = useMemo(
    () =>
      selectedSkillIds.length +
      cityIds.length +
      Number(direction !== "all") +
      Number(gender !== "any"),
    [cityIds.length, direction, gender, selectedSkillIds.length],
  );

  const filters = useMemo<FiltersValue>(
    () => ({ direction, skillIds: selectedSkillIds, gender, cityIds }),
    [direction, selectedSkillIds, gender, cityIds],
  );

  useEffect(() => {
    onChange?.(filters);
  }, [filters, onChange]);

  const clearFilters = () => {
    setDirection("all");
    setGender("any");
    setCityIds([]);
    setCityFilterKey((key) => key + 1);
    dispatch(clearSkillFilter());
  };

  return (
    <aside className={styles.panel} aria-label="Панель фильтров">
      <div className={styles.header}>
        <Title size="H2" className={styles.heading}>
          <span>Фильтры</span>
          {selectedCount > 0 && (
            <span className={styles.counter} aria-live="polite">
              {` (${selectedCount})`}
            </span>
          )}
        </Title>
        <div className={styles.clearButtonSlot}>
          {selectedCount > 0 && <ClearFilterButton onClick={clearFilters} />}
        </div>
      </div>

      <div className={styles.groups}>
        <RadioGroup
          name="skill-direction"
          options={DIRECTION_OPTIONS}
          value={direction}
          onChange={setDirection}
        />
        <SkillFilter />
        <GenderFilter value={gender} onChange={setGender} />
        <CityFilter
          key={cityFilterKey}
          onChange={(selectedCityIds) => setCityIds(selectedCityIds)}
        />
      </div>
    </aside>
  );
}
