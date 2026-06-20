import { useState } from "react";
import { Play } from "lucide-react";
import Reveal from "./Reveal";

const CLIPS = [
  { src: "/videos/model1.mp4", label: "Detection · clip 1" },
  { src: "/videos/model2.mp4", label: "Detection · clip 2" },
  { src: "/videos/model3.mp4", label: "Detection · clip 3" },
  { src: "/videos/model4.mp4", label: "Detection · clip 4" },
];

/** Lazy video tile — only downloads when the viewer chooses to play it. */
function Clip({ src, label }: { src: string; label: string }) {
  const [play, setPlay] = useState(false);
  return (
    <figure className="figure-frame overflow-hidden">
      <div className="relative aspect-video bg-sunken">
        {play ? (
          <video
            className="h-full w-full object-cover"
            src={src}
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlay(true)}
            className="group flex h-full w-full items-center justify-center"
            aria-label={`Play ${label}`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-rule bg-surface text-ink transition-transform group-hover:scale-110">
              <Play className="h-5 w-5 translate-x-0.5 fill-current" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex items-center justify-between border-t border-rule px-4 py-2.5">
        <span className="text-sm text-graphite">{label}</span>
        <span className="microlabel">.mp4</span>
      </figcaption>
    </figure>
  );
}

export default function DemoStrip() {
  return (
    <Reveal className="mt-12">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <span className="microlabel">The detection feed</span>
        <span className="microlabel">lazy-loaded</span>
      </div>
      <p className="mb-6 max-w-prose text-sm leading-relaxed text-graphite">
        Upstream of the controller, a YOLOv8 vehicle-detection pipeline turns camera
        frames into the per-lane vehicle counts that become the agent&rsquo;s state
        vector. These clips show that detection running.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        {CLIPS.map((c) => (
          <Clip key={c.src} {...c} />
        ))}
      </div>
    </Reveal>
  );
}
