/* eslint-disable react/react-in-jsx-scope */
import { ImEarth } from "react-icons/im";
import { SiTelegram, SiDiscord, SiTwitter, SiYoutube, SiLinkedin, SiMedium } from "react-icons/si";

export const swtichSocialIcon = (iconName: string) => {
    let socialComponent: any = '';

    switch (iconName) {
        case "website":
            socialComponent = <ImEarth />;
            break;

        case "telegram":
            socialComponent = <SiTelegram />;
            break;

        case "discord":
            socialComponent = <SiDiscord />;
            break;

        case "twitter":
            socialComponent = <SiTwitter />;
            break;

        case "youtube":
            socialComponent = <SiYoutube />;
            break;

        case "linkedIn":
            socialComponent = <SiLinkedin />;
            break;

        case "medium":
            socialComponent = <SiMedium />;
            break;
    }
    
    return socialComponent;
};