import { Grid, ImageCard, Rows, Text } from "@canva/app-ui-kit";
import type { QueuedImage } from "@canva/asset";
import { upload } from "@canva/asset";
import { addElementAtPoint, ui } from "@canva/design";
import * as styles from "styles/utils.css";
import { FormattedMessage, useIntl } from "react-intl";

// Define ImageType interface locally since it's no longer in src/api
interface ImageType {
  label: string;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  fullsize: {
    url: string;
    width: number;
    height: number;
  };
}

const THUMBNAIL_HEIGHT = 150;

const uploadImage = async (image: ImageType): Promise<QueuedImage> => {
  // Upload the image using @canva/asset.
  const queuedImage = await upload({
    type: "image",
    mimeType: "image/jpeg",
    thumbnailUrl: image.thumbnail.url,
    url: image.fullsize.url,
    width: image.fullsize.width,
    height: image.fullsize.height,
    aiDisclosure: "app_generated",
  });

  return queuedImage;
};

export const ImageGrid = () => {
  // Note: generatedImages is no longer part of the context since we moved to code-only generation
  // This component is kept for potential future use but currently has no images to display
  const generatedImages: ImageType[] = [];

  const onDragStart = async (
    event: React.DragEvent<HTMLElement>,
    image: ImageType,
  ) => {
    const parentNode = event.currentTarget.parentElement;
    try {
      parentNode?.classList.add(styles.hidden);

      await ui.startDragToPoint(event, {
        type: "image",
        resolveImageRef: () => uploadImage(image),
        previewUrl: image.thumbnail.url,
        previewSize: {
          width: image.thumbnail.width,
          height: image.thumbnail.height,
        },
        fullSize: {
          width: image.fullsize.width,
          height: image.fullsize.height,
        },
      });
    } finally {
      parentNode?.classList.remove(styles.hidden);
    }
  };

  const onImageClick = async (image: ImageType) => {
    const queuedImage = await uploadImage(image);

    await addElementAtPoint({
      type: "image",
      altText: { text: image.label, decorative: false },
      ref: queuedImage.ref,
    });
  };

  const intl = useIntl();

  return (
    <Rows spacing="1u">
      <Text size="medium" variant="bold">
        <FormattedMessage
          defaultMessage="Select or drag to add to design"
          description="Instruction to the user on how they can add the generated image to their design"
        />
      </Text>
      <Grid columns={2} spacing="2u">
        {generatedImages.map((image, index) => (
          <ImageCard
            key={index}
            thumbnailUrl={image.thumbnail.url}
            onClick={() => onImageClick(image)}
            ariaLabel={intl.formatMessage({
              defaultMessage: "Add image to design",
              description:
                "Aria label for the image card. When the image card is pressed, it will add the image to the design",
            })}
            alt={image.label}
            thumbnailHeight={THUMBNAIL_HEIGHT}
            borderRadius="standard"
            onDragStart={(event: React.DragEvent<HTMLElement>) =>
              onDragStart(event, image)
            }
          />
        ))}
      </Grid>
    </Rows>
  );
};
