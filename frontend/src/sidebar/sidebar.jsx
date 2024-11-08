import CloseIcon from "@mui/icons-material/Close";
import { Drawer, IconButton, CardActionArea, Tooltip } from "@mui/material";
import { Card, CardMedia, Typography, Grid2 as Grid } from "@mui/material";

function ImageCardHorizontal({ imageSrc, title, onClick, height, width }) {
    return (
        <CardActionArea
            onClick={onClick}
            style={{ alignItems: "center", width: "100%" }}
        >
            <Card
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    width: "95%",
                    boxShadow: "none",
                }}
            >
                <CardMedia
                    component="img"
                    src={imageSrc}
                    alt={title}
                    sx={{ width: width, height: height }}
                />
                <Tooltip title={title} arrow>
                    <Typography
                        variant="h6"
                        sx={{
                            marginLeft: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {title}
                    </Typography>
                </Tooltip>
            </Card>
        </CardActionArea>
    );
}

export const ImageDrawer = ({
    open,
    onClose,
    clickWrapper,
    items,
    imageSrc,
    title,
    description,
}) => {
    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <div style={{ width: "384px", padding: "8px" }}>
                <IconButton onClick={onClose} style={{ float: "right" }}>
                    <CloseIcon />
                </IconButton>

                <img
                    src={imageSrc}
                    alt={title}
                    style={{
                        height: "128px",
                        width: "100%",
                        borderRadius: "8px",
                        objectFit: "cover", // Crops to fill the container
                        objectPosition: "center", // Centers the cropped area
                    }}
                />

                <Typography variant="h6" style={{ marginTop: "16px" }}>
                    {title}
                </Typography>
                <Typography variant="body1">{description}</Typography>

                <Grid container spacing={0.5} sx={{ marginTop: 2 }} columns={2}>
                    {items.map((id, ind) => (
                        <Grid
                            xs={4}
                            sm={4}
                            md={4}
                            key={id}
                            sx={{ flexShrink: 0 }}
                            width={"100%"}
                        >
                            <ImageCardHorizontal
                                imageSrc={imageSrc}
                                title={id}
                                onClick={() => clickWrapper(ind)}
                                height={32}
                                width={64}
                            />
                        </Grid>
                    ))}
                </Grid>
            </div>
        </Drawer>
    );
};
