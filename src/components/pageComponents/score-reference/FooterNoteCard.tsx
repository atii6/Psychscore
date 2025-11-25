import { Card, CardContent } from "@/components/ui/card";

function FooterNoteCard() {
  return (
    <Card
      className="border-0 shadow-lg rounded-2xl"
      style={{ backgroundColor: "var(--card-background)" }}
    >
      <CardContent className="p-6">
        <div className="text-center">
          <h3
            className="font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Clinical Usage Note
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            These descriptive terms follow standard clinical psychology
            conventions. Standard scores have a mean of 100 and standard
            deviation of 15. Scaled scores have a mean of 10 and standard
            deviation of 3. Always refer to the specific test manual for
            complete interpretive guidelines.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default FooterNoteCard;
