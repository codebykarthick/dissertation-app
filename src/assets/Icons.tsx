import * as React from "react";
import Svg, { Path } from "react-native-svg";

type IconProps = {
    stroke: string
}

export const HomeIcon = (props: IconProps) => (
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none" {...props}>
        <Path
            d="M4.5 13.5L18 3L31.5 13.5V30C31.5 30.7956 31.1839 31.5587 30.6213 32.1213C30.0587 32.6839 29.2956 33 28.5 33H7.5C6.70435 33 5.94129 32.6839 5.37868 32.1213C4.81607 31.5587 4.5 30.7956 4.5 30V13.5Z"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
        <Path
            d="M13.5 33V18H22.5V33"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
    </Svg>
);

export const ArrowLeftIcon = (props: IconProps) => (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
        <Path
            d="M22.1667 14H5.83337"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
        <Path
            d="M14 22.1667L5.83337 14L14 5.83337"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
    </Svg>
);


export const CameraGridIcon = (props: IconProps) => (
    <Svg width={390} height={540} viewBox="0 0 390 540" fill="none" {...props}>
        <Path d="M123 123h144v292a10 10 0 0 1-10 10H133a10 10 0 0 1-10-10V123z" stroke={props.stroke} strokeWidth={4} fill={props.stroke} />
        <Path d="M193 123V0" stroke={props.stroke} strokeWidth={4} fill={props.stroke} />
        <Path d="M0 267h123" stroke={props.stroke} strokeWidth={4} fill={props.stroke} />
        <Path d="M269 267h123" stroke={props.stroke} strokeWidth={4} fill={props.stroke} />
        <Path d="M193 540V417" stroke={props.stroke} strokeWidth={4} fill={props.stroke} />
    </Svg>
);



export const CameraShutterIcon = (props: IconProps) => (
    <Svg width={72} height={72} viewBox="0 0 72 72" fill="none" {...props}>
        <Path d="M36 6a30 30 0 1 1 0 60 30 30 0 0 1 0-60Z" fill={props.stroke} stroke={props.stroke} />
        <Path d="M36 1a35 35 0 1 1 0 70 35 35 0 0 1 0-70Z" stroke={props.stroke} strokeWidth={2} fill={props.stroke} />
    </Svg>
);

export const CameraIcon = (props: IconProps) => (
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none" {...props}>
        <Path
            d="M34.5 28.5C34.5 29.2956 34.1839 30.0587 33.6213 30.6213C33.0587 31.1839 32.2956 31.5 31.5 31.5H4.5C3.70435 31.5 2.94129 31.1839 2.37868 30.6213C1.81607 30.0587 1.5 29.2956 1.5 28.5V12C1.5 11.2044 1.81607 10.4413 2.37868 9.87868C2.94129 9.31607 3.70435 9 4.5 9H10.5L13.5 4.5H22.5L25.5 9H31.5C32.2956 9 33.0587 9.31607 33.6213 9.87868C34.1839 10.4413 34.5 11.2044 34.5 12V28.5Z"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
        <Path
            d="M18 25.5C21.3137 25.5 24 22.8137 24 19.5C24 16.1863 21.3137 13.5 18 13.5C14.6863 13.5 12 16.1863 12 19.5C12 22.8137 14.6863 25.5 18 25.5Z"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
    </Svg>
);



export const CheckIcon = (props: IconProps) => (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
        <Path
            d="M10.5 12.8333L14 16.3333L25.6667 4.66663"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
        <Path
            d="M24.5 14V22.1667C24.5 22.7855 24.2542 23.379 23.8166 23.8166C23.379 24.2542 22.7855 24.5 22.1667 24.5H5.83333C5.21449 24.5 4.621 24.2542 4.18342 23.8166C3.74583 23.379 3.5 22.7855 3.5 22.1667V5.83333C3.5 5.21449 3.74583 4.621 4.18342 4.18342C4.621 3.74583 5.21449 3.5 5.83333 3.5H18.6667"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
    </Svg>
);



export const FilterIcon = (props: IconProps) => (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
        <Path
            d="M21 23.3333V11.6666"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
        <Path
            d="M14 23.3333V4.66663"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
        <Path
            d="M7 23.3334V16.3334"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
    </Svg>
);


export const FlashOnIcon = (props: IconProps) => (
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none" {...props}>
        <Path
            d="M19.5 3L4.5 21H18L16.5 33L31.5 15H18L19.5 3Z"
            fill={props.stroke}
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);


export const GalleryIcon = (props: IconProps) => (
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none" {...props}>
        <Path
            d="M28.5 4.5H7.5C5.84315 4.5 4.5 5.84315 4.5 7.5V28.5C4.5 30.1569 5.84315 31.5 7.5 31.5H28.5C30.1569 31.5 31.5 30.1569 31.5 28.5V7.5C31.5 5.84315 30.1569 4.5 28.5 4.5Z"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
        <Path
            d="M12.75 15C13.9926 15 15 13.9926 15 12.75C15 11.5074 13.9926 10.5 12.75 10.5C11.5074 10.5 10.5 11.5074 10.5 12.75C10.5 13.9926 11.5074 15 12.75 15Z"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
        <Path
            d="M31.5 22.5L24 15L7.5 31.5"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
    </Svg>
);



export const SearchIcon = (props: IconProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
            d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
        <Path
            d="M21 21L16.65 16.65"
            stroke={props.stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={props.stroke}
        />
    </Svg>
);