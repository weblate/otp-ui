import styled, { css } from "styled-components";
import { Circle } from "styled-icons/fa-solid";

import { AerialTram, Bus, Streetcar, Max, Wes } from "@opentripplanner/icons";

// note: want to make these props of styled, so props.colorselected
// BTW, 'props.color' works, since that's an established prop of styled
// https://stackoverflow.com/questions/52321539/react-passing-props-with-styled-components
const white = "#fff";
const black = "#000";
const defColor = black;
const defSelected = "#00bfff";

export const normal = css`
  color: ${props => props.color || defColor};
  fill: ${props => props.color || defColor};
  border: 1px solid ${props => props.color || defColor};
  background-color: ${white};
  :hover {
    fill: ${black} !important;
    color: ${props => props.colorselected || defSelected};
    background-color: ${props => props.colorselected || defSelected};
    border: 1px solid ${black};
  }
  border-radius: 50%;
`;

export const tracked = css`
  fill: ${black} !important;
  color: ${props => props.colorselected || defSelected};
  border: 1px solid ${black};
  background-color: ${props => props.colorselected || defSelected};
`;

export const VehicleCircle = styled(Circle)`
  ${normal}
  background-color: ${props => props.color || defColor};
`;

export const TrackedVehicleCircle = styled(VehicleCircle)`
  ${tracked}
`;

export const NormBus = styled(Bus)`
  ${normal}
`;

export const TrackedBus = styled(NormBus)`
  ${tracked}
`;

export const NormTram = styled(Max)`
  ${normal}
`;

export const TrackedTram = styled(NormTram)`
  ${tracked}
`;

export const NormSC = styled(Streetcar)`
  ${normal}
`;

export const TrackedSC = styled(NormSC)`
  ${tracked}
`;

export const NormGond = styled(AerialTram)`
  ${normal}
`;

export const TrackedGond = styled(NormGond)`
  ${tracked}
`;

export const NormRail = styled(Wes)`
  ${normal}
`;

export const TrackedRail = styled(NormRail)`
  ${tracked}
`;

export const TooltipStyle = styled.span``;

TooltipStyle.Title = styled.span`
  font-size: 110%;
  font-weight: bold;
`;

export const PopupStyle = styled.div`
  display: inline-block;
  box-sizing: border-box;
  > * {
    box-sizing: border-box;
    overflow: hidden;
    white-space: nowrap;
  }
`;

PopupStyle.Title = styled.div`
  font-size: 110%;
  font-weight: bold;
  text-align: center;
`;

PopupStyle.Span = styled.span`
  font-size: 90%;
  display: block;
`;

PopupStyle.Button = styled.button`
  cursor: pointer;
  width: 100%;
  height: 100%;

  svg,
  img {
    vertical-align: middle;
    max-width: 1.25em;
    margin: 0 0.25em;
    height: 1.25em;
  }
  &.active {
    font-weight: 600;
    box-shadow: 0 0 2px 2px rgba(0, 64, 255, 0.5);
  }
  &.disabled {
    cursor: default;
  }
  &.disabled svg {
    fill: #ccc;
  }
`;
