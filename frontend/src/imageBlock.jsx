import {
    Card,
    CardMedia,
    CardContent,
    ButtonBase,
    Typography,
} from "@mui/material";
import { React, useEffect, useState } from "react";

function ImageCard({
    imageSources, // Array of image URLs
    title,
    onClick,
    height = 100,
    rotationInterval = 3000, // Default rotation interval in milliseconds
}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        let interval;

        // Start rotating images on hover
        if (isHovered) {
            interval = setInterval(() => {
                setCurrentImageIndex(
                    (prevIndex) => (prevIndex + 1) % imageSources.length // Cycle through images
                );
            }, rotationInterval);
        }

        // Clean up interval when hover stops or component unmounts
        return () => clearInterval(interval);
    }, [isHovered, imageSources.length, rotationInterval]);

    return (
        <ButtonBase
            onClick={onClick}
            style={{ width: "100%" }}
            onMouseEnter={() => setIsHovered(true)} // Start rotation on hover
            onMouseLeave={() => {
                setIsHovered(false);
                setCurrentImageIndex(0); // reset image
            }} // Stop rotation when hover ends
        >
            <Card>
                <CardMedia
                    component="img"
                    alt={title}
                    height={height}
                    width={height * 1.5}
                    image={imageSources[currentImageIndex]} // Display current image
                />
                <CardContent>
                    <Typography variant="h5" component="div">
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {title}
                    </Typography>
                </CardContent>
            </Card>
        </ButtonBase>
    );
}

export default ImageCard;
