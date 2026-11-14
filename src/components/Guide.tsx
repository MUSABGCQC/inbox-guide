"use client";

import { useState } from "react";

const PHRASES = ["F2F GP today", "F2F GP", "GP"] as const;
type Phrase = (typeof PHRASES)[number];
type Choice = "accept" | "decline" | "later" | "phone";
type Screen = "list" | "inbox" | "call" | "done" | "telephone" | "pharmacist" | "unwritten";

const INSTRUCTIONS = [
  { id: "f2f-today", label: "F2F today" },
  { id: "telephone-today", label: "Telephone today" },
  { id: "pharmacist-task", label: "Pharmacist task" },
  { id: "pharmacy-first", label: "Pharmacy first" },
  { id: "routine-f2f", label: "Routine F2F" },
  { id: "routine-telephone", label: "Routine telephone" },
  { id: "hub-today", label: "Hub today" },
  { id: "hub-saturday", label: "Hub Saturday" },
  { id: "sda", label: "SDA" },
  { id: "womens-health-clinic", label: "Women's health clinic" },
  { id: "sda-111", label: "SDA 111 slot" },
  { id: "womens-health-telephone", label: "Women's health telephone" },
  { id: "nurse", label: "Nurse appointment" },
  { id: "anp", label: "ANP" },
  { id: "eps", label: "EPS" },
  { id: "private-letter", label: "Private letter pathway" },
  { id: "home-visit", label: "Home visit" },
] as const;

type InstructionId = (typeof INSTRUCTIONS)[number]["id"];

function triageReason(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `triage ${day}.${month}.${year}`;
}

export function Guide() {
  const [phrase, setPhrase] = useState<Phrase>("F2F GP today");
  const [screen, setScreen] = useState<Screen>("list");
  const [instruction, setInstruction] = useState<InstructionId | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [booked, setBooked] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saidYes, setSaidYes] = useState(false);

  function restart() {
    setScreen("inbox");
    setChoice(null);
    setBooked(false);
    setHidden(false);
    setSaved(false);
    setSaidYes(false);
  }

  function openInstruction(id: InstructionId) {
    setInstruction(id);
    setChoice(null);
    setBooked(false);
    setHidden(false);
    setSaved(false);
    setSaidYes(false);
    setScreen(
      id === "f2f-today" ? "inbox" : id === "telephone-today" ? "telephone" : id === "pharmacist-task" ? "pharmacist" : "unwritten",
    );
  }

  function backToList() {
    setScreen("list");
    setInstruction(null);
    setChoice(null);
    setBooked(false);
    setHidden(false);
    setSaved(false);
    setSaidYes(false);
  }

  function pick(next: Choice) {
    setChoice(next);
    setBooked(false);
    setHidden(false);
    setSaved(false);
    setScreen("done");
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <p className="text-sm font-semibold tracking-wide text-[var(--accent)]">Inbox guide</p>
        {screen === "list" ? null : (
          <button type="button" onClick={backToList} className="text-link">
            All instructions
          </button>
        )}
      </header>

      {screen === "list" ? (
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">Which instruction is in the inbox?</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            The doctor has already reviewed the Accurx request. Choose the instruction they sent.
          </p>
          <div className="mt-5 grid gap-2">
            {INSTRUCTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openInstruction(item.id)}
                className="choice"
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {screen === "unwritten" ? (
        <section className="rounded-3xl bg-[var(--card)] p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">
            {INSTRUCTIONS.find((item) => item.id === instruction)?.label}
          </h1>
          <p className="mt-3 text-base leading-7">
            The steps for this instruction are not written up yet. Ask the doctor who sent it which list it goes on.
          </p>
        </section>
      ) : null}

      {screen === "telephone" ? <TelephoneToday /> : null}

      {screen === "pharmacist" ? <PharmacistTask /> : null}

      {screen === "inbox" || screen === "call" || screen === "done" ? (
      <>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={restart} className="text-link">
          Start again
        </button>
      </div>
      <ol className="mb-6 grid grid-cols-3 gap-2 text-center text-xs">
        {["Inbox", "Call", "Next step"].map((label, index) => {
          const active = index === 0 ? screen === "inbox" : index === 1 ? screen === "call" : screen === "done";
          return (
            <li
              key={label}
              className={`rounded-full px-2 py-1 ${active ? "bg-[var(--accent)] text-white" : "bg-white text-[var(--muted)]"}`}
            >
              {index + 1}. {label}
            </li>
          );
        })}
      </ol>

      {screen === "inbox" ? (
        <section className="rounded-3xl bg-[var(--card)] p-6 shadow-sm">
          <p className="text-sm leading-6 text-[var(--muted)]">
            The patient sent an Accurx request. A doctor reviewed it. It is now in your inbox.
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{phrase}</h1>
          <p className="mt-2 text-base leading-7">Give them a face-to-face appointment today.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PHRASES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPhrase(item)}
                className={`chip ${phrase === item ? "chip-on" : ""}`}
              >
                {item}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">These three words mean the same thing.</p>
          <button
            type="button"
            onClick={() => setScreen("call")}
            className="go"
          >
            Call the patient
          </button>
        </section>
      ) : null}

      {screen === "call" ? (
        <section className="rounded-3xl bg-[var(--card)] p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">On the call</h1>
          <p className="mt-4 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-base leading-7">
            Hello, is this the family of [patient name]?
          </p>
          {saidYes ? (
            <>
              <p className="mt-3 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-base leading-7">
                Hi, I’m calling from [practice name]. The doctor has had a look at the triage request you have put through and we have an appointment available at [time].
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Say the practice name, and the time of the slot. For a 9:15am slot, say 9:15am.
              </p>
              <div className="mt-4 space-y-2">
                <button type="button" onClick={() => pick("accept")} className="choice">
                  They accept the earliest time
                </button>
                <button type="button" onClick={() => pick("decline")} className="choice">
                  They say no
                </button>
              </div>
            </>
          ) : (
            <button type="button" onClick={() => setSaidYes(true)} className="choice mt-4">
              They say yes
            </button>
          )}
        </section>
      ) : null}

      {screen === "done" && choice === "accept" ? (
        <section className="rounded-3xl bg-[var(--card)] p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Book this slot</h1>
          <p className="mt-2 text-base leading-7">
            In EMIS, book the earliest purple or cream 15-minute slot that says F2F.
          </p>
          <div className="mt-4 space-y-2">
            <Slot start="09:00" end="09:15" tone="purple" />
            <Slot start="09:15" end="09:30" tone="cream" />
          </div>
          <ReasonBox />
          {booked ? (
            <>
              <p className="mt-4 text-base leading-7">Booked. That reason stays on the slot, not in the consultation.</p>
              <AccurxText kind="f2f" timing="9:15am" />
            </>
          ) : (
            <button
              type="button"
              onClick={() => setBooked(true)}
              className="go"
            >
              I’ve booked it
            </button>
          )}
        </section>
      ) : null}

      {screen === "done" && choice === "decline" ? (
        <section className="rounded-3xl bg-[var(--card)] p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">If they say no</h1>
          <p className="mt-4 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-base leading-7">
            Could you hold the line? I need to check with the doctor.
          </p>
          <div className="mt-4 space-y-2">
            <button type="button" onClick={() => setChoice("later")} className="choice">
              They want a later time
            </button>
            <p className="text-sm leading-6 text-[var(--muted)]">
              You can’t book a later time yourself. It may be a clinical emergency, or the doctor may not feel comfortable with the patient’s symptoms being delayed and seen in the afternoon.
            </p>
            <button type="button" onClick={() => setChoice("phone")} className="choice">
              They want a telephone appointment
            </button>
            <p className="text-sm leading-6 text-[var(--muted)]">
              You can’t change this to a telephone appointment yourself. The patient may need a physical examination, so you need to ask the doctor.
            </p>
          </div>
        </section>
      ) : null}

      {screen === "done" && (choice === "later" || choice === "phone") ? (
        <HoldScreen
          choice={choice}
          booked={booked}
          hidden={hidden}
          saved={saved}
          onBook={() => setBooked(true)}
          onHide={() => setHidden(true)}
          onSave={() => setSaved(true)}
        />
      ) : null}
      </>
      ) : null}
    </main>
  );
}

function noNote(choice: "later" | "phone", ending: "yes" | "now" | "persistent") {
  const wanted = choice === "later" ? "later" : "telephone";
  const shared = `Offered patient earliest f2f today, patient declined and wanted ${wanted} today instead, spoke to doctor and the doctor said ${ending === "yes" ? "yes" : "no"}.`;
  if (ending === "yes") return shared;
  const told = `${shared} Told the patient the doctor would like to see them now.`;
  if (ending === "now") return `${told} Patient agreed to be seen now.`;
  return `${told} Patient was still persistent. Advised we don’t have anything, and to call 111, 999, or go to the nearest hospital.`;
}

function ReasonBox() {
  return (
    <div className="mt-4 rounded-2xl border border-[#c5d0dc] bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Reason</p>
      <p className="mt-1 text-base font-semibold">{triageReason()}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Type this in the reason when you book the slot. It stays on the appointment, not in the consultation.
      </p>
    </div>
  );
}

function ukDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function AccurxText({ kind, timing }: { kind: "f2f" | "telephone"; timing?: string }) {
  const [replied, setReplied] = useState(false);
  const [picked, setPicked] = useState(false);
  const [half, setHalf] = useState<"morning" | "afternoon" | null>(null);
  const [sent, setSent] = useState(false);
  const template = kind === "f2f" ? "Face to face appointment" : "Telephone appointment";
  const written = kind === "f2f" ? `${ukDate()} at ${timing ?? "9:15am"}` : half ? `${ukDate()}, ${half}` : "";

  return (
    <div className="mt-5">
      <p className="text-sm font-medium">Text the patient on Accurx</p>
      <p className="mt-2 text-base leading-7">Press Reply. The templates are already there.</p>
      {!replied ? (
        <button type="button" onClick={() => setReplied(true)} className="choice mt-3">
          Reply
        </button>
      ) : null}
      {replied && !picked ? (
        <button type="button" onClick={() => setPicked(true)} className="choice mt-3">
          {template}
        </button>
      ) : null}
      {picked && kind === "telephone" && !half ? (
        <div className="mt-3 space-y-2">
          <p className="text-base leading-7">Write the date, then morning or afternoon.</p>
          <button type="button" onClick={() => setHalf("morning")} className="choice">
            Morning
          </button>
          <button type="button" onClick={() => setHalf("afternoon")} className="choice">
            Afternoon
          </button>
        </div>
      ) : null}
      {picked && written && !sent ? (
        <>
          <div className="mt-3 rounded-2xl border border-[#c5d0dc] bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Accurx</p>
            <p className="mt-2 text-sm font-semibold">{template}</p>
            <p className="mt-1 text-base">{written}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {kind === "f2f"
              ? "Write the date of the appointment and the time of the slot."
              : "Write the date of the appointment, then morning or afternoon."}
          </p>
          <button type="button" onClick={() => setSent(true)} className="go">
            I’ve sent the text
          </button>
        </>
      ) : null}
      {sent ? <p className="mt-3 text-base leading-7">Text sent.</p> : null}
    </div>
  );
}

function PharmacistTask() {
  const [step, setStep] = useState<"up" | "add" | "type" | "assign" | "paste" | "urgent" | "send" | "text">("up");
  const [sent, setSent] = useState(false);
  const rank = ["up", "add", "type", "assign", "paste", "urgent", "send", "text"];
  const reached = (name: (typeof rank)[number]) => rank.indexOf(step) >= rank.indexOf(name);

  return (
    <section className="rounded-3xl bg-[var(--card)] p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Pharmacist task</h1>
      <p className="mt-2 text-base leading-7">The doctor has sent a pharmacist task. It has come through triage, so the task is urgent.</p>

      {step === "up" ? (
        <button type="button" onClick={() => setStep("add")} className="choice mt-4">
          Get the patient up
        </button>
      ) : (
        <p className="mt-4 text-sm font-medium">Patient is up.</p>
      )}

      {reached("add") ? (
        step === "add" ? (
          <button type="button" onClick={() => setStep("type")} className="choice mt-3">
            Add task
          </button>
        ) : (
          <p className="mt-3 text-sm font-medium">Task added.</p>
        )
      ) : null}

      {reached("type") ? (
        <div className="mt-4 rounded-2xl border border-[#c5d0dc] bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Task type</p>
          {step === "type" ? (
            <>
              <p className="mt-2 text-base leading-7">Open the dropdown and click Patient note.</p>
              <button type="button" onClick={() => setStep("assign")} className="choice mt-3">
                Patient note
              </button>
            </>
          ) : (
            <p className="mt-2 text-base font-semibold">Patient note</p>
          )}
          {reached("assign") ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Assign to</p>
              {step === "assign" ? (
                <button type="button" onClick={() => setStep("paste")} className="choice mt-3">
                  Pharmacist
                </button>
              ) : (
                <p className="mt-2 text-base font-semibold">Pharmacist</p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {reached("paste") ? (
        step === "paste" ? (
          <>
            <p className="mt-4 text-base leading-7">Copy the triage the patient wrote, and paste it into the task.</p>
            <div className="mt-3 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-base leading-7">[The patient’s triage]</div>
            <button type="button" onClick={() => setStep("urgent")} className="choice mt-3">
              I’ve pasted it
            </button>
          </>
        ) : (
          <p className="mt-4 text-sm font-medium">Patient’s triage is in the task.</p>
        )
      ) : null}

      {reached("urgent") ? (
        step === "urgent" ? (
          <>
            <p className="mt-4 text-base leading-7">Mark the task as urgent. It has come through triage.</p>
            <button type="button" onClick={() => setStep("send")} className="choice mt-3">
              Mark as urgent
            </button>
          </>
        ) : (
          <p className="mt-4 text-sm font-medium">Marked urgent.</p>
        )
      ) : null}

      {reached("send") ? (
        step === "send" ? (
          <button type="button" onClick={() => setStep("text")} className="go">
            Send the task
          </button>
        ) : (
          <p className="mt-4 text-sm font-medium">Task sent to the pharmacist.</p>
        )
      ) : null}

      {reached("text") ? (
        <>
          <p className="mt-5 text-sm font-medium">Text the patient</p>
          <div className="mt-3 rounded-2xl border border-[#c5d0dc] bg-white p-3 text-base leading-7">
            The pharmacist team is looking into this and we will contact you should there be anything that the pharmacist would like to speak to you about.
          </div>
          {sent ? (
            <p className="mt-3 text-base leading-7">Text sent.</p>
          ) : (
            <button type="button" onClick={() => setSent(true)} className="go">
              I’ve sent the text
            </button>
          )}
        </>
      ) : null}
    </section>
  );
}

function HoldScreen({
  choice,
  booked,
  hidden,
  saved,
  onBook,
  onHide,
  onSave,
}: {
  choice: "later" | "phone";
  booked: boolean;
  hidden: boolean;
  saved: boolean;
  onBook: () => void;
  onHide: () => void;
  onSave: () => void;
}) {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const [reply, setReply] = useState<"now" | "persistent" | null>(null);
  const [hungUp, setHungUp] = useState(false);
  const later = choice === "later";
  const why = later
    ? "You can’t book a later time yourself. It may be a clinical emergency, or the doctor may not feel comfortable with the patient’s symptoms being delayed and seen in the afternoon."
    : "You can’t change this to a telephone appointment yourself. The patient may need a physical examination, so you need to ask the doctor.";
  return (
    <section className="rounded-3xl bg-[var(--card)] p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">If they say no</h1>
      <p className="mt-2 text-base leading-7">{later ? "They want a later time." : "They want a telephone appointment."}</p>
      <p className="mt-4 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-base leading-7">
        Could you hold the line? I need to check with the doctor.
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{why}</p>

      {answer === null ? (
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => setAnswer("yes")}
            className="choice"
          >
            The doctor said yes
          </button>
          <button
            type="button"
            onClick={() => setAnswer("no")}
            className="choice"
          >
            The doctor said no
          </button>
        </div>
      ) : null}

      {answer === "yes" && !booked ? (
        <>
          <p className="mt-4 text-base leading-7">
            {later ? "Book a later purple or cream F2F slot." : "Book a telephone slot."}
          </p>
          {later ? (
            <div className="mt-4 space-y-2">
              <Slot start="14:00" end="14:15" tone="purple" />
              <Slot start="14:15" end="14:30" tone="cream" />
            </div>
          ) : (
            <div className="mt-4">
              <ShortSlot label="Telephone" detail="Green · shorter" color="#2f8f4e" text="#ffffff" />
            </div>
          )}
          <ReasonBox />
          <button
            type="button"
            onClick={onBook}
            className="go"
          >
            I’ve booked it
          </button>
        </>
      ) : null}

      {answer === "yes" && booked ? (
        <>
          <AccurxText kind={later ? "f2f" : "telephone"} timing={later ? "2:00pm" : undefined} />
          <NoteCard
            lines={[noNote(choice, "yes")]}
            hidden={hidden}
            saved={saved}
            onHide={onHide}
            onSave={onSave}
            caption="Write this in the consultation. The triage date is already in the reason on the slot. Press Hide, then save."
          />
        </>
      ) : null}

      {answer === "no" ? (
        <>
          <p className="mt-4 text-sm font-medium">The doctor said no. Do not book the time they asked for.</p>
          <p className="mt-3 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-base leading-7">
            The doctor would like to see you now.
          </p>
          {reply === null ? (
            <div className="mt-4 space-y-2">
              <button type="button" onClick={() => setReply("now")} className="choice">
                They will come now
              </button>
              <button type="button" onClick={() => setReply("persistent")} className="choice">
                They are still persistent
              </button>
            </div>
          ) : null}
          {reply === "now" && !booked ? (
            <>
              <p className="mt-4 text-base leading-7">Book the earliest purple or cream F2F slot.</p>
              <div className="mt-4 space-y-2">
                <Slot start="09:00" end="09:15" tone="purple" />
                <Slot start="09:15" end="09:30" tone="cream" />
              </div>
              <ReasonBox />
              <button type="button" onClick={onBook} className="go">
                I’ve booked it
              </button>
            </>
          ) : null}
          {reply === "now" && booked ? (
            <>
              <AccurxText kind="f2f" timing="9:15am" />
              <NoteCard
                lines={[noNote(choice, "now")]}
                hidden={hidden}
                saved={saved}
                onHide={onHide}
                onSave={onSave}
                caption="Write this in the consultation. The triage date is already in the reason on the slot. Press Hide, then save."
              />
            </>
          ) : null}
          {reply === "persistent" ? (
            <p className="mt-3 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-base leading-7">
              We don’t have anything. Please call 111 or 999, or go to the nearest hospital.
            </p>
          ) : null}
          {reply === "persistent" && !hungUp ? (
            <button type="button" onClick={() => setHungUp(true)} className="go">
              I’ve hung up
            </button>
          ) : null}
          {hungUp ? (
            <NoteCard
              lines={[noNote(choice, "persistent")]}
              hidden={hidden}
              saved={saved}
              onHide={onHide}
              onSave={onSave}
              caption="After you hang up, write everything that happened in the consultation. Press Hide, then save."
            />
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function NoteCard({
  lines,
  hidden,
  saved,
  onHide,
  onSave,
  caption = "Write this in the consultation. Press Hide, then save.",
}: {
  lines: string[];
  hidden: boolean;
  saved: boolean;
  onHide: () => void;
  onSave: () => void;
  caption?: string;
}) {
  return (
    <div className="mt-5">
      <p className="text-sm font-medium">Write this in the consultation</p>
      <div className="mt-2 overflow-hidden rounded-2xl border border-[#c5d0dc]">
        <div className="bg-[#0b3a6a] px-3 py-2 text-sm font-medium text-white">Consultation</div>
        <div className="bg-white p-3">
          <div
            className={`rounded-md border px-3 py-2 text-sm leading-6 ${hidden ? "border-dashed border-[#8f2d2d] bg-[#fbf6f6]" : "border-[#d5dde6]"}`}
          >
            {lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {hidden ? (
            <p className="mt-2 text-xs text-[#8f2d2d]">Hidden. Only you and your colleagues can see this.</p>
          ) : null}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              disabled={!hidden || saved}
              onClick={onSave}
              className="rounded-lg border-2 border-[#0b3a6a] bg-white px-4 py-2 text-sm font-bold text-[#0b3a6a] shadow-[0_3px_0_#0b3a6a] disabled:opacity-40"
            >
              {saved ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              onClick={onHide}
              className={`rounded-lg border-2 border-[#6d2424] px-4 py-2 text-sm font-bold text-white shadow-[0_3px_0_#6d2424] ${hidden ? "bg-[#6d2424]" : "bg-[#8f2d2d]"}`}
            >
              Hide
            </button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{caption}</p>
      {saved ? <p className="mt-3 text-sm font-medium text-[var(--accent)]">Saved in the consultation.</p> : null}
    </div>
  );
}

function TelephoneToday() {
  const [step, setStep] = useState<"call" | "choose" | "green" | "convert">("call");
  const [menuOpen, setMenuOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [changed, setChanged] = useState(false);
  const [booked, setBooked] = useState(false);
  const [saidYes, setSaidYes] = useState(false);

  function openMenu(event: { preventDefault: () => void }) {
    event.preventDefault();
    setMenuOpen(true);
  }

  return (
    <section className="rounded-3xl bg-[var(--card)] p-6 shadow-sm">
      {step === "call" ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Telephone today</h1>
          <p className="mt-4 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-base leading-7">
            Hello, is this the family of [patient name]?
          </p>
          {saidYes ? (
            <>
              <p className="mt-3 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-base leading-7">
                Hi, I’m calling from [practice name]. The doctor has had a look at the triage request you have put through and we are looking to book you in for a telephone appointment today. The doctor will call you between 9am and 1pm.
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Say the practice name. 9am and 1pm are the example. Say the start and end of that doctor’s clinic.
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSaidYes(true)}
              className="choice mt-4"
            >
              They say yes
            </button>
          )}
          {saidYes ? (
            <button
              type="button"
              onClick={() => setStep("choose")}
              className="go"
            >
              Look at the appointment book
            </button>
          ) : null}
        </>
      ) : null}

      {step === "choose" ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">What is free?</h1>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setStep("green")}
              className="choice"
            >
              There is a green telephone slot
            </button>
            <button
              type="button"
              onClick={() => setStep("convert")}
              className="choice"
            >
              There are no green slots
            </button>
          </div>
        </>
      ) : null}

      {step === "green" ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Book the green slot</h1>
          <p className="mt-2 text-base leading-7">
            The green telephone slot is shorter than a purple face-to-face slot. Book the green one.
          </p>
          <div className="mt-4 space-y-3">
            <ShortSlot label="Telephone" detail="Green · shorter" color="#2f8f4e" text="#ffffff" />
            <TallSlot />
          </div>
          <ReasonBox />
          {booked ? (
            <>
              <p className="mt-4 text-base leading-7">Booked. That reason stays on the slot, not in the consultation.</p>
              <AccurxText kind="telephone" />
            </>
          ) : (
            <button
              type="button"
              onClick={() => setBooked(true)}
              className="go"
            >
              I’ve booked it
            </button>
          )}
        </>
      ) : null}

      {step === "convert" ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">No green slot</h1>
          <p className="mt-2 text-base leading-7">Right-click the purple slot, then open slot properties.</p>
          <div className="relative mt-4">
            <button
              type="button"
              onClick={openMenu}
              onContextMenu={openMenu}
              className="slot-hit flex min-h-16 w-full flex-col justify-center rounded-md px-3 text-left text-white"
              style={{ background: changed ? "#5c3d8f" : "#5c3d8f" }}
            >
              <span className="text-base font-semibold">{changed ? "#telephone advice" : "F2F"}</span>
              <span className="text-xs opacity-80">Purple slot · right-click</span>
            </button>
            {menuOpen && !propertiesOpen ? (
              <button
                type="button"
                onClick={() => setPropertiesOpen(true)}
                className="menu-hit absolute left-8 top-14"
              >
                Slot properties
              </button>
            ) : null}
          </div>
          {propertiesOpen ? (
            <div className="mt-4 rounded-2xl border border-[#c5d0dc] bg-white p-3">
              <p className="text-sm font-medium">Slot properties</p>
              <p className="mt-2 text-xs text-[var(--muted)]">Slot type</p>
              <button
                type="button"
                onClick={() => setChanged(true)}
                className="choice mt-2"
              >
                #telephone advice
              </button>
            </div>
          ) : null}
          {changed ? (
            <>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                Say the start and end of that doctor’s clinic. For a clinic from 9am to 1pm, say:
              </p>
              <p className="mt-2 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-base leading-7">
                The doctor will call you between 9am and 1pm.
              </p>
              <ReasonBox />
              {booked ? (
                <>
                  <p className="mt-4 text-base leading-7">Booked. That reason stays on the slot, not in the consultation.</p>
                  <AccurxText kind="telephone" />
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setBooked(true)}
                  className="go"
                >
                  I’ve booked it
                </button>
              )}
            </>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function ShortSlot({
  label,
  detail,
  color,
  text,
}: {
  label: string;
  detail: string;
  color: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-14 text-xs leading-4 text-[var(--muted)]">09:00</div>
      <div className="flex h-9 flex-1 flex-col justify-center rounded-md px-3" style={{ background: color, color: text }}>
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-[10px] opacity-80">{detail}</span>
      </div>
    </div>
  );
}

function TallSlot() {
  return (
    <div className="flex items-stretch gap-3 opacity-70">
      <div className="w-14 pt-2 text-xs leading-4 text-[var(--muted)]">
        <div>09:00</div>
        <div>09:15</div>
      </div>
      <div className="flex min-h-16 flex-1 flex-col justify-center rounded-md bg-[#5c3d8f] px-3 text-white">
        <span className="text-base font-semibold">F2F</span>
        <span className="text-xs opacity-80">Purple · longer face-to-face slot</span>
      </div>
    </div>
  );
}

function Slot({ start, end, tone }: { start: string; end: string; tone: "purple" | "cream" }) {
  const purple = tone === "purple";
  return (
    <div className="flex items-stretch gap-3">
      <div className="w-14 pt-2 text-xs leading-4 text-[var(--muted)]">
        <div>{start}</div>
        <div>{end}</div>
      </div>
      <div
        className="flex min-h-16 flex-1 flex-col justify-center rounded-md px-3"
        style={{
          background: purple ? "#5c3d8f" : "#f3e2c0",
          color: purple ? "#fff" : "#3a3124",
        }}
      >
        <span className="text-base font-semibold">F2F</span>
        <span className="text-xs opacity-80">{purple ? "Purple" : "Cream"} · 15 min</span>
      </div>
    </div>
  );
}
