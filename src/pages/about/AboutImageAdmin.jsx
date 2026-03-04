import { saveConfig } from "../../lib/api";
import { Card, CardHeader, CardBody } from "../../components/Card";
import ImageUpload from "../../components/ImageUpload";

export default function AboutImageAdmin() {
  const handleUploaded = async (url) => {
    await saveConfig({ aboutImage: url });
  };

  return (
    <div style={{ maxWidth: "720px" }}>
      <Card>
        <CardHeader
          title="About Page Image"
          subtitle="Portrait image shown on the about page"
        />
        <CardBody>
          <ImageUpload
            folder="about"
            icon="🛕"
            maxMB={8}
            hint="Recommended: Portrait · Min 600×700px · 3:4 ratio · JPG or WEBP · Max 8MB"
            onUploaded={handleUploaded}
          />
        </CardBody>
      </Card>
    </div>
  );
}
