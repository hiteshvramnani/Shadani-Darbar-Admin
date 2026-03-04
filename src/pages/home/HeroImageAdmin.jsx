import { saveConfig } from "../../lib/api";
import { Card, CardHeader, CardBody } from "../../components/Card";
import ImageUpload from "../../components/ImageUpload";

export default function HeroImageAdmin() {
  const handleUploaded = async (url) => {
    await saveConfig({ heroImage: url });
  };

  return (
    <div style={{ maxWidth: "720px" }}>
      <Card>
        <CardHeader
          title="Hero Banner Image"
          subtitle="Main banner shown at the top of the home page"
        />
        <CardBody>
          <ImageUpload
            folder="hero"
            icon="🖼️"
            maxMB={10}
            hint="Recommended: Landscape · Min 1920×640px · 3:1 ratio · JPG or WEBP · Max 10MB"
            onUploaded={handleUploaded}
          />
        </CardBody>
      </Card>
    </div>
  );
}
