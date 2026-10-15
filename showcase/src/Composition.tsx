import {
  AbsoluteFill,
  Easing,
  interpolate,
  Series,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  bg: "#07111f",
  panel: "#101f33",
  green: "#45d483",
  blue: "#56a8ff",
  amber: "#ffbf5b",
  red: "#ff6b76",
  text: "#f4f8ff",
  muted: "#9bb0c9",
};

const Frame: React.FC<React.PropsWithChildren<{ eyebrow: string }>> = ({
  eyebrow,
  children,
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 80% 10%, #18375b 0%, ${C.bg} 48%)`,
      color: C.text,
      fontFamily: "Inter, Arial, sans-serif",
      padding: "120px 86px",
    }}
  >
    <div
      style={{
        color: C.green,
        fontSize: 34,
        fontWeight: 800,
        letterSpacing: 5,
      }}
    >
      {eyebrow}
    </div>
    {children}
    <div
      style={{
        position: "absolute",
        bottom: 72,
        left: 86,
        right: 86,
        display: "flex",
        justifyContent: "space-between",
        color: C.muted,
        fontSize: 28,
      }}
    >
      <span>github.com/criguex</span>
      <span>Playwright · TypeScript · Zod</span>
    </div>
  </AbsoluteFill>
);

const Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame eyebrow="API QUALITY ENGINEERING">
      <div
        style={{
          marginTop: 180,
          fontSize: 104,
          lineHeight: 1.02,
          fontWeight: 900,
          opacity: interpolate(frame, [0, 0.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(
            frame,
            [0, 0.7 * fps],
            ["0px 80px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        RESTFUL
        <br />
        BOOKER
      </div>
      <div
        style={{
          marginTop: 50,
          color: C.muted,
          fontSize: 46,
          lineHeight: 1.35,
        }}
      >
        From a technical exercise
        <br />
        to a release-ready test framework.
      </div>
    </Frame>
  );
};

const Pipeline = () => {
  const frame = useCurrentFrame();
  const stages = [
    ["01", "Docker target", C.blue],
    ["02", "Smoke gate", C.green],
    ["03", "API regression", C.green],
    ["04", "Zod contracts", C.amber],
    ["05", "Performance", C.blue],
    ["06", "Reports + CI", C.green],
  ] as const;
  return (
    <Frame eyebrow="TEST FLOW">
      <div style={{ marginTop: 70, fontSize: 84, fontWeight: 900 }}>
        Every gate has a job.
      </div>
      <div style={{ display: "grid", gap: 24, marginTop: 70 }}>
        {stages.map(([n, label, color], i) => (
          <div
            key={n}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 30,
              padding: "27px 34px",
              borderRadius: 24,
              backgroundColor: C.panel,
              borderLeft: `10px solid ${color}`,
              opacity: interpolate(frame, [i * 8, i * 8 + 14], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(
                frame,
                [i * 8, i * 8 + 14],
                ["60px 0px", "0px 0px"],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            }}
          >
            <span style={{ color, fontSize: 32, fontWeight: 900 }}>{n}</span>
            <span style={{ fontSize: 46, fontWeight: 750 }}>{label}</span>
            <span style={{ marginLeft: "auto", color: C.green, fontSize: 34 }}>
              ✓
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 50, color: C.muted, fontSize: 34 }}>
        Feedback in seconds · evidence on every failure
      </div>
    </Frame>
  );
};

const Coverage = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame eyebrow="COVERAGE">
      <div
        style={{
          marginTop: 130,
          fontSize: 220,
          fontWeight: 950,
          color: C.green,
        }}
      >
        {Math.round(
          interpolate(frame, [0, 1.5 * fps], [0, 27], {
            extrapolateRight: "clamp",
          }),
        )}
      </div>
      <div style={{ fontSize: 68, fontWeight: 900 }}>automated validations</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 26,
          marginTop: 90,
        }}
      >
        {[
          "CRUD lifecycle",
          "Authentication",
          "Authorization",
          "Data integrity",
          "API contracts",
          "Performance",
        ].map((label) => (
          <div
            key={label}
            style={{
              padding: "32px 28px",
              borderRadius: 24,
              backgroundColor: C.panel,
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            <span style={{ color: C.green }}>✓ </span>
            {label}
          </div>
        ))}
      </div>
    </Frame>
  );
};

const Defect = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame eyebrow="REAL DEFECT FOUND">
      <div
        style={{
          marginTop: 130,
          fontSize: 96,
          fontWeight: 900,
          lineHeight: 1.06,
        }}
      >
        XML body.
        <br />
        Wrong header.
      </div>
      <div
        style={{
          marginTop: 80,
          padding: "52px 42px",
          borderRadius: 28,
          backgroundColor: "#1a1720",
          border: `3px solid ${C.red}`,
          opacity: interpolate(frame, [0.3 * fps, 1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div style={{ color: C.muted, fontSize: 34 }}>Expected</div>
        <div style={{ color: C.green, fontSize: 42, fontFamily: "monospace" }}>
          application/xml
        </div>
        <div style={{ color: C.muted, fontSize: 34, marginTop: 36 }}>
          Actual
        </div>
        <div style={{ color: C.red, fontSize: 42, fontFamily: "monospace" }}>
          text/html
        </div>
      </div>
      <div style={{ marginTop: 52, fontSize: 38, color: C.muted }}>
        Reproducible · documented · regression guarded
      </div>
    </Frame>
  );
};

const Outro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame eyebrow="SHIP WITH CONFIDENCE">
      <div
        style={{
          marginTop: 260,
          fontSize: 112,
          lineHeight: 1,
          fontWeight: 950,
          scale: interpolate(frame, [0, 0.8 * fps], [0.82, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 200 }),
            output: "perceptual-scale",
          }),
        }}
      >
        CI GREEN.
        <br />
        RISKS VISIBLE.
      </div>
      <div
        style={{ marginTop: 75, color: C.blue, fontSize: 44, fontWeight: 800 }}
      >
        criguex/restful-booker-quality-suite
      </div>
    </Frame>
  );
};

export const QualityShort: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <Series>
      <Series.Sequence
        name="Introduction"
        durationInFrames={3 * fps}
        premountFor={fps}
      >
        <Intro />
      </Series.Sequence>
      <Series.Sequence
        name="Test flow"
        durationInFrames={4 * fps}
        premountFor={fps}
      >
        <Pipeline />
      </Series.Sequence>
      <Series.Sequence
        name="Coverage"
        durationInFrames={3 * fps}
        premountFor={fps}
      >
        <Coverage />
      </Series.Sequence>
      <Series.Sequence
        name="Defect"
        durationInFrames={3 * fps}
        premountFor={fps}
      >
        <Defect />
      </Series.Sequence>
      <Series.Sequence
        name="Closing"
        durationInFrames={3 * fps}
        premountFor={fps}
      >
        <Outro />
      </Series.Sequence>
    </Series>
  );
};
