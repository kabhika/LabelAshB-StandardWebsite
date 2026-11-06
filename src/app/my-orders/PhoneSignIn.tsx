"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { signInWithPhone } from "./actions";

const inputClass = "mt-2 w-full rounded-labelashb-sm border border-labelashb-ink-soft bg-labelashb-ground px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-labelashb-ink";

export function PhoneSignIn() {
  const [state, action, pending] = useActionState(signInWithPhone, {});
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.phone) codeInput.current?.focus();
  }, [state.phone]);

  return (
    <section aria-labelledby="phone-sign-in" className="mt-8 rounded-labelashb-sm border border-labelashb-border bg-labelashb-ground-alt p-5 sm:p-6">
      <h2 id="phone-sign-in" className="text-labelashb-h3">Sign in with your mobile number</h2>
      <p className="mt-2 text-labelashb-body text-labelashb-ink-soft">
        Use the number from checkout to view linked orders on any device.
      </p>
      <form key={state.phone ?? "phone"} action={action} className="mt-5 max-w-sm">
        {state.phone ? (
          <>
            <input type="hidden" name="phone" value={state.phone} />
            <label htmlFor="login-code" className="block font-medium">SMS code</label>
            <input ref={codeInput} id="login-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required className={inputClass} />
            <p className="mt-2 text-labelashb-small text-labelashb-ink-soft">Sent to the number ending in {state.phone.slice(-4)}.</p>
          </>
        ) : (
          <>
            <label htmlFor="login-phone" className="block font-medium">Indian mobile number</label>
            <input id="login-phone" name="phone" type="tel" autoComplete="tel" maxLength={32} required className={inputClass} />
          </>
        )}
        {state.error && <p role="alert" className="mt-3 text-labelashb-error">{state.error}</p>}
        {state.message && !state.error && <p role="status" className="mt-3">{state.message}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="submit" name="step" value={state.phone ? "verify" : "send"} disabled={pending}>
            {pending ? "Please wait…" : state.phone ? "Verify and sign in" : "Send code"}
          </Button>
          {state.phone && (
            <>
              <Button type="submit" name="step" value="resend" variant="secondary" formNoValidate disabled={pending}>Resend code</Button>
              <button type="submit" name="step" value="change" formNoValidate disabled={pending} className="min-h-11 underline underline-offset-2">Change number</button>
            </>
          )}
        </div>
      </form>
    </section>
  );
}
