import React, { FC, SVGProps, useRef, useEffect, useState } from "react";

interface IconProps {
    name: string;
    variant?: "lined" | "solid" | "gradate" | "illustrated"
}
export const Icon: FC<IconProps> = ({ name, variant = "lined", ...rest }) => {
    const [ImportedIcon, setImportedIcon] = useState<FC<SVGProps<SVGSVGElement>> | null>(null);

    const [loading, setLoading] = useState(false);
    useEffect((): void => {
        setLoading(true);
        const importIcon = async (): Promise<void> => {
            try {
                // Changing this line works fine to me
                const imported = (await import(`!!@svgr/webpack?-svgo,+titleProp,+ref!./../../../../../public/assets/icon/v2/${variant}/${name}.svg`)).default;

                setImportedIcon(() => imported);

            } catch (err) {
                throw err;
            } finally {
                setLoading(false);
            }
        };
        importIcon();
    }, [name, variant]);

    if (!loading && ImportedIcon) {
        // const { current: IconNew } = importedIcon;
        return <ImportedIcon {...rest} data-name={name} data-variant={variant} />;

        // return <IconNew {...rest} data-name={name} data-variant={variant} />;
    }
    return null;
};