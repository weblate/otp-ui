import coreUtils from "@opentripplanner/core-utils";
import CSS from "csstype";
import { TriMetModeIcon } from "@opentripplanner/icons";
import React, { ElementType, ReactElement, useCallback, useState } from "react";

import ModeSelector from "../ModeSelector";
import SubmodeSelector from "../SubmodeSelector";
import GeneralSettingsPanel from "../GeneralSettingsPanel";
import * as S from "../styled";
import {
  getModeOptions,
  getTransitSubmodeOptions,
  getCompaniesForModeId,
  getCompaniesOptions,
  getBicycleOrMicromobilityModeOptions,
  isBike
} from "../util";
// eslint-disable-next-line prettier/prettier
import type {
  ConfiguredCompany,
  ConfiguredModes,
  FullModeOption,
  ModeOption,
  QueryParamChangeEvent
} from "../types";

// FIXME: merge with the other QueryParams
interface QueryParams {
  [key: string]: string;
}

interface SettingsSelectorPanelProps {
  /**
   * The CSS class name to apply to this element.
   */
  className?: string;
  /**
   * The icon component for rendering mode icons. Defaults to the OTP-UI TriMetModeIcon component.
   */
  ModeIcon?: ElementType;
  /**
   * Triggered when a query parameter is changed.
   * @param params An object that contains the new values for the parameter(s) that has (have) changed.
   */
  onQueryParamChange?: (evt: QueryParamChangeEvent) => void;
  /**
   * An object {parameterName: value, ...} whose attributes correspond to query parameters.
   * For query parameter names and value formats,
   * see https://github.com/opentripplanner/otp-ui/blob/master/packages/core-utils/src/__tests__/query.js#L14
   */
  queryParams?: QueryParams;
  /**
   * Standard React inline style prop.
   */
  style?: CSS.Properties;
  /**
   * An array of supported companies that will be displayed as options where applicable.
   */
  supportedCompanies?: ConfiguredCompany[];
  /**
   * An array of supported modes that will be displayed as options.
   */
  supportedModes: ConfiguredModes;
}

function getSelectedCompanies(queryParams: QueryParams) {
  const { companies } = queryParams;
  return companies ? companies.split(",") : [];
}

function getSelectedModes(queryParams: QueryParams) {
  const { mode } = queryParams;
  const modes = mode ? mode.split(",") : [];

  // Map OTP Flex modes to custom flex mode
  return coreUtils.query.reduceOtpFlexModes(modes);
}

/**
 * Helper function so that TypeScript propagates the correct type for ModeOption.
 */
function isFullModeOption(modeOption: ModeOption): modeOption is FullModeOption {
  return typeof modeOption !== "string";
}

/**
 * The Settings Selector Panel allows the user to set trip search preferences,
 * such as modes, providers, and speed preferences.
 */
export default function SettingsSelectorPanel({
  className = null,
  ModeIcon = TriMetModeIcon,
  onQueryParamChange = null,
  queryParams = null,
  style = null,
  supportedCompanies = [],
  supportedModes = null
}: SettingsSelectorPanelProps): ReactElement {
  const [defaultAccessModeCompany, setDefaultAccessModeCompany] = useState(null);
  const [lastTransitModes, setLastTransitModes] = useState([]);

  const selectedModes = getSelectedModes(queryParams);
  const selectedCompanies = getSelectedCompanies(queryParams);

  const handleQueryParamChange = useCallback(
    queryParam => {
      if (typeof onQueryParamChange === "function") {
        onQueryParamChange(queryParam);
      }
    },
    [onQueryParamChange]
  );

  const toggleSubmode = useCallback(
    (name, id, submodes, filter = o => o, after) => {
      const newSubmodes = [].concat(submodes);
      const idx = newSubmodes.indexOf(id);

      // If the clicked mode is selected, then unselect it, o/w select it.
      // Leave at least one selected, as in newplanner.trimet.org.
      if (idx >= 0) {
        const subset = newSubmodes.filter(filter);
        if (subset.length >= 2) {
          newSubmodes.splice(idx, 1);
        }
      } else {
        newSubmodes.push(id);
      }

      if (newSubmodes.length !== submodes.length) {
        handleQueryParamChange({
          [name]: newSubmodes.join(",")
        });
        if (after) after(newSubmodes);
      }
    },
    [onQueryParamChange]
  );

  const handleMainModeChange = useCallback(
    (id: string) => {
      const newModes = id.split("+");

      if (newModes[0] === "TRANSIT") {
        const activeTransitModes = selectedModes.filter(
          coreUtils.itinerary.isTransit
        );

        const lastOrAllTransitModes = lastTransitModes.length === 0
          ? supportedModes.transitModes
            .filter(isFullModeOption)
            .map(modeObj => modeObj.mode)
          : lastTransitModes;
        
        const {
          defaultAccessModeCompany: defAccessModeCompany,
          companies,
          nonTransitModes
        } = getCompaniesForModeId(id, supportedCompanies);

        // Add previously selected transit modes only if none were active.
        const finalModes = (activeTransitModes.length > 0
          ? activeTransitModes
          : lastOrAllTransitModes
        ).concat(nonTransitModes);

        handleQueryParamChange({
          companies: companies.join(","),
          mode: finalModes.join(",")
        });

        setDefaultAccessModeCompany(defAccessModeCompany && defAccessModeCompany[0]);
      } else {
        handleQueryParamChange({
          companies: "", // New req: Don't list companies with this mode?
          mode: newModes.join(",")
        });
      }
    },
    [onQueryParamChange, queryParams, lastTransitModes]
  );

  const handleTransitModeChange = useCallback(
    id => {
      toggleSubmode(
        "mode",
        id,
        selectedModes,
        coreUtils.itinerary.isTransit,
        newModes => {
          setLastTransitModes(newModes.filter(coreUtils.itinerary.isTransit));
        }
      );
    },
    [onQueryParamChange, queryParams]
  );

  const handleCompanyChange = useCallback(
    (id: string) => toggleSubmode("companies", id, selectedCompanies, undefined, () => {}),
    [onQueryParamChange, queryParams]
  );

  const modeOptions = getModeOptions(
    ModeIcon,
    supportedModes,
    selectedModes,
    selectedCompanies,
    supportedCompanies
  );
  const transitModes = getTransitSubmodeOptions(
    ModeIcon,
    supportedModes,
    selectedModes
  );
  const nonTransitModes = selectedModes.filter(
    m => !coreUtils.itinerary.isTransit(m)
  );
  const companies = getCompaniesOptions(
    supportedCompanies.filter(comp =>
      defaultAccessModeCompany ? comp.id === defaultAccessModeCompany : true
    ),
    nonTransitModes,
    selectedCompanies
  );
  const bikeModes = getBicycleOrMicromobilityModeOptions(
    ModeIcon,
    supportedModes.bicycleModes,
    selectedModes
  );
  const scooterModes = getBicycleOrMicromobilityModeOptions(
    ModeIcon,
    supportedModes.micromobilityModes,
    selectedModes
  );

  return (
    <S.SettingsSelectorPanel className={className} style={style}>
      <ModeSelector
        modes={modeOptions}
        onChange={handleMainModeChange}
        style={{ margin: "0px -5px", paddingBottom: "8px" }}
      />

      <S.SettingsHeader>Travel Preferences</S.SettingsHeader>

      {selectedModes.some(coreUtils.itinerary.isTransit) &&
        transitModes.length >= 2 && (
          <SubmodeSelector
            label="Use"
            modes={transitModes}
            onChange={handleTransitModeChange}
          />
        )}

      {/* The bike trip type selector */}
      {/* TODO: Handle different bikeshare networks */}
      {selectedModes.some(isBike) &&
        !selectedModes.some(coreUtils.itinerary.isTransit) && (
          <SubmodeSelector
            label="Use"
            inline
            modes={bikeModes}
            onChange={handleMainModeChange}
          />
        )}

      {/* The micromobility trip type selector */}
      {/* TODO: Handle different micromobility networks */}
      {selectedModes.some(coreUtils.itinerary.isMicromobility) &&
        !selectedModes.some(coreUtils.itinerary.isTransit) && (
          <SubmodeSelector
            label="Use"
            inline
            modes={scooterModes}
            onChange={handleMainModeChange}
          />
        )}

      {/* This order is probably better. */}
      {companies.length >= 2 && (
        <SubmodeSelector
          label="Use companies"
          modes={companies}
          onChange={handleCompanyChange}
        />
      )}

      <GeneralSettingsPanel
        query={queryParams}
        supportedModes={supportedModes}
        onQueryParamChange={handleQueryParamChange}
      />
    </S.SettingsSelectorPanel>
  );
}
