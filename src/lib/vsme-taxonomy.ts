const RAW_TAGS = [
  "vsme:B1-BasisForPreparationMember",
  "vsme:B1BasisForPreparationAndOtherUndertakingSGeneralInformationMember",
  "vsme:B1ListOfSubsidiariesMember",
  "vsme:B1DisclosureOfSustainabilityRelatedCertificationSOrLabelSMember",
  "vsme:B1ListOfSiteSMember",
  "vsme:B2-PracticesPoliciesAndFutureInitiativesForTransitioningTowardsAMoreSustainableEconomyMember",
  "vsme:B2CooperativeSpecificDisclosuresMember",
  "vsme:B3-EnergyAndGreenhouseGasEmissionsMember",
  "vsme:B3TotalEnergyConsumptionInMWhMember",
  "vsme:B3BreakdownOfEnergyConsumptionInMWhMember",
  "vsme:B3EstimatedGreenhouseGasEmissionsConsideringTheGHGProtocolVersion2004InTCO2eMember",
  "vsme:B3GreenhouseGasEmissionIntensityPerTurnoverMember",
  "vsme:B4-PollutionOfAirWaterAndSoilMember",
  "vsme:B5-BiodiversityMember",
  "vsme:B5SitesInBiodiversitySensitiveAreasMember",
  "vsme:B5BiodiversityLandUseMember",
  "vsme:B6-WaterMember",
  "vsme:B6WaterWithdrawalMember",
  "vsme:B6WaterConsumptionMember",
  "vsme:B7-ResourceUseCircularEconomyAndWasteManagementMember",
  "vsme:B7DescriptionOfCircularEconomyPrinciplesMember",
  "vsme:B7WasteGeneratedMember",
  "vsme:B7AnnualMassFlowOfRelevantMaterialsUsedMember",
  "vsme:B8-WorkforceGeneralCharacteristicsMember",
  "vsme:B8TypeOfContractMember",
  "vsme:B8GenderMember",
  "vsme:B8CountryOfEmploymentMember",
  "vsme:B8TurnoverRateMember",
  "vsme:B9-WorkforceHealthAndSafetyMember",
  "vsme:B10-WorkforceRemunerationCollectiveBargainingAndTrainingMember",
  "vsme:B10RemunerationCollectiveBargainingMember",
  "vsme:B10NumberOfTrainingHoursPerEmployeeMember",
  "vsme:B11-ConvictionsAndFinesForCorruptionAndBriberyMember",
  "vsme:C1-StrategyBusinessModelAndSustainabilityRelatedInitiativesMember",
  "vsme:C2-DescriptionOfPracticesPoliciesAndFutureInitiativesForTransitioningTowardsAMoreSustainableEconomyMember",
  "vsme:C3-GhgReductionTargetsAndClimateTransitionMember",
  "vsme:C3GHGReductionTargetsInTC02eMember",
  "vsme:C3DisclosureOfListOfMainActionsTheEntitySeeksInOrderToAchieveItsTargetsMember",
  "vsme:C3TransitionPlanForUndertakingsOperatingInHighClimateImpactSectorsMember",
  "vsme:C4-ClimateRisksMember",
  "vsme:C5-AdditionalGeneralWorkforceCharacteristicsMember",
  "vsme:C6-AdditionalOwnWorkforceInformationHumanRightsPoliciesAndProcessesMember",
  "vsme:C7-SevereNegativeHumanRightsIncidentsMember",
  "vsme:C8-RevenuesFromCertainSectorsAndExclusionFromEuReferenceBenchmarksMember",
  "vsme:C8RevenuesFromCertainActivitiesMember",
  "vsme:C8ExclusionFromEUReferenceBenchmarksMember",
  "vsme:C9-GenderDiversityRatioInTheGovernanceBodyMember",
  "vsme:DisclosureOfAnyOtherGeneralAndOrEntitySpecificInformation",
  "vsme:DisclosureOfAnyOtherEnvironmentalAndOrEntitySpecificEnvironmentalDisclosures",
  "vsme:DisclosureOfAnyOtherSocialAndOrEntitySpecificSocialDisclosures",
  "vsme:DisclosureOfAnyOtherGovernanceAndOrEntitySpecificGovernanceDisclosures",
] as const;

export type TaxonomyNode = {
  id: string;
  tag: string;
  code: string | null;
  title: string;
};

export type TaxonomyGroup = TaxonomyNode & {
  children: TaxonomyNode[];
};

function humanize(tag: string): { code: string | null; title: string } {
  let name = tag.replace(/^vsme:/, "").replace(/Member$/, "");
  const codeMatch = name.match(/^([A-C]\d+)(-)?/);
  const code = codeMatch ? codeMatch[1] : null;
  if (code) name = name.slice(codeMatch![0].length);

  const title = name
    // split camel/Pascal boundaries while keeping acronyms together
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  return { code, title: title.charAt(0).toUpperCase() + title.slice(1) };
}

export const taxonomyGroups: TaxonomyGroup[] = (() => {
  const groups: TaxonomyGroup[] = [];

  for (const tag of RAW_TAGS) {
    const { code, title } = humanize(tag);
    const isChild =
      code !== null && !tag.includes(`${code}-`) && groups.length > 0 && groups[groups.length - 1].code === code;

    const node: TaxonomyNode = { id: tag, tag, code, title };
    if (isChild) {
      groups[groups.length - 1].children.push(node);
    } else {
      groups.push({ ...node, children: [] });
    }
  }

  return groups;
})();

export const taxonomyTotalCount = taxonomyGroups.reduce((total, group) => total + 1 + group.children.length, 0);

export const taxonomyAllIds = taxonomyGroups.flatMap((group) => [group.id, ...group.children.map((c) => c.id)]);

export function sectionLabel(code: string | null): string {
  if (!code) return "General";
  return code.startsWith("B") ? "Basic module" : "Comprehensive module";
}
