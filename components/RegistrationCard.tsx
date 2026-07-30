"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Music2, Phone, User } from "lucide-react";

import { registerAttendee } from "@/actions/register";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { SuccessModal, type RegistrationSummary } from "@/components/SuccessModal";
import { DURATION, EASE_ENTER } from "@/lib/motion";
import {
  formatPhoneInput,
  messageForErrorCode,
  normalizeFullName,
  normalizeSongName,
  registrationSchema,
} from "@/lib/validation";
import type { RegistrationFormValues } from "@/types/registration";

const EMPTY_FORM: RegistrationFormValues = {
  fullName: "",
  phone: "",
  songName: "",
  honeypot: "",
};

/**
 * Three fields behind one button.
 *
 * The page opens as a single call to action; the form unfolds in place when it
 * is tapped. Most visitors arrive on a phone, so nothing is asked for until
 * they have said they want to register — and once open, the card is only the
 * three fields and one send button. No steps, no headings inside the form.
 */
export function RegistrationCard() {
  const [open, setOpen] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<RegistrationSummary | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const submitLock = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: EMPTY_FORM,
  });

  /**
   * Registered in visual order: React Hook Form focuses the first *registered*
   * field that has an error, so registering the phone first would send focus
   * past the name field on a failed submit.
   */
  const nameField = register("fullName");
  const phoneField = register("phone");
  const songField = register("songName");

  /** Open, then bring the whole card into view without stealing focus — a
   *  forced focus here would throw up the keyboard before anyone had looked. */
  const handleOpen = () => {
    setOpen(true);
    window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  };

  const onSubmit = async (values: RegistrationFormValues) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setSubmissionError(null);

    try {
      const result = await registerAttendee(values);

      if (result.status === "success") {
        /* Read back exactly what was submitted, so the confirmation is checkable. */
        setConfirmation({
          name: normalizeFullName(values.fullName),
          phone: formatPhoneInput(values.phone),
          song: normalizeSongName(values.songName),
        });
        reset(EMPTY_FORM);
        setModalOpen(true);
        return;
      }

      const message = messageForErrorCode(result.code);
      /*
       * Show the reason once. When it belongs to a field, it goes under that
       * field; the banner is only for failures with nowhere else to live.
       */
      if (result.field && result.field !== "honeypot") {
        setError(result.field, { type: "server", message });
      } else {
        setSubmissionError(message);
      }
    } catch {
      /*
       * The action itself failed to complete. Only claim a connection problem
       * when the browser actually reports one — otherwise a server-side fault
       * would be blamed on the visitor's internet.
       */
      const offline = typeof navigator !== "undefined" && navigator.onLine === false;
      setSubmissionError(messageForErrorCode(offline ? "NETWORK" : "UNKNOWN"));
    } finally {
      submitLock.current = false;
    }
  };

  return (
    <section ref={sectionRef} id="register" aria-label="Бүртгэл" className="w-full scroll-mt-8">
      {open ? null : (
        <div className="mx-auto w-full max-w-[22rem]">
          <Button size="lg" fullWidth onClick={handleOpen} aria-expanded={false}>
            Бүртгүүлэх
          </Button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: DURATION.compose, ease: EASE_ENTER }}
            className="overflow-hidden"
          >
            <div className="glass relative overflow-hidden rounded-[1.75rem] border border-white/[0.09] edge-lit">
              <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                className="px-5 pb-7 pt-7 sm:px-9 sm:pb-9 sm:pt-9"
              >
                {/* Bot trap. Off-screen, never announced, never tabbable. */}
                <div
                  aria-hidden="true"
                  className="absolute -left-[9999px] top-0 size-0 overflow-hidden"
                >
                  <input type="text" tabIndex={-1} autoComplete="off" {...register("honeypot")} />
                </div>

                {/* Fields lock while the action is in flight, so nothing can be
                    edited between validation and the write. */}
                <fieldset
                  disabled={isSubmitting}
                  className="min-w-0 border-0 p-0 transition-opacity duration-300 ease-enter disabled:opacity-60"
                >
                  <div className="grid gap-1 sm:grid-cols-2 sm:gap-x-4">
                    <Input
                      label="Нэр"
                      autoComplete="name"
                      autoCapitalize="words"
                      spellCheck={false}
                      enterKeyHint="next"
                      icon={User}
                      error={errors.fullName?.message}
                      {...nameField}
                    />
                    <Input
                      label="Утасны дугаар"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      enterKeyHint="next"
                      maxLength={9}
                      prefix="+976"
                      icon={Phone}
                      error={errors.phone?.message}
                      {...phoneField}
                      onChange={(event) => {
                        event.target.value = formatPhoneInput(event.target.value);
                        void phoneField.onChange(event);
                      }}
                    />
                  </div>

                  <Input
                    label="Дууны нэр"
                    autoComplete="off"
                    spellCheck={false}
                    enterKeyHint="done"
                    maxLength={90}
                    icon={Music2}
                    error={errors.songName?.message}
                    {...songField}
                  />
                </fieldset>

                <AnimatePresence initial={false}>
                  {submissionError ? (
                    <motion.div
                      key={submissionError}
                      role="alert"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: DURATION.state, ease: EASE_ENTER }}
                      className="mt-4 flex items-start gap-3 rounded-2xl border border-brand/25 bg-brand/[0.07] px-4 py-3.5"
                    >
                      <AlertCircle
                        aria-hidden="true"
                        strokeWidth={1.5}
                        className="mt-px size-[1.0625rem] shrink-0 text-brand-hi"
                      />
                      <p className="text-[0.8125rem] leading-relaxed text-white/75">
                        {submissionError}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  loadingLabel="Илгээж байна"
                  className="mt-5 sm:mt-6"
                >
                  Илгээх
                </Button>

                {/* Progress is visible on the button; this makes it audible too. */}
                <p aria-live="polite" className="sr-only">
                  {isSubmitting ? "Бүртгэлийг илгээж байна" : ""}
                </p>

                <p className="mt-4 text-center text-[0.6875rem] leading-relaxed text-white/50">
                  Нэг утасны дугаараар зөвхөн нэг удаа бүртгүүлэх боломжтой. Таны дугаарыг бүртгэл
                  баталгаажуулахад ашиглана.
                </p>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SuccessModal open={modalOpen} onClose={() => setModalOpen(false)} summary={confirmation} />
    </section>
  );
}
