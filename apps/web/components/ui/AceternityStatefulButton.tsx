"use client";

import {AnimatePresence, motion} from "motion/react";
import {Check, LoaderCircle} from "lucide-react";
import type {ButtonHTMLAttributes, ReactNode} from "react";

type ButtonStatus = "idle" | "loading" | "success";

type AceternityStatefulButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  status?: ButtonStatus;
  children: ReactNode;
};

export default function AceternityStatefulButton({
                                                   status = "idle",
                                                   children,
                                                   className = "",
                                                   disabled,
                                                   onDrag,
                                                   onDragStart,
                                                   onDragEnd,
                                                   onAnimationStart,
                                                   onAnimationEnd,
                                                   ...props
                                                 }: AceternityStatefulButtonProps) {
  const isDisabled = disabled || status === "loading";

  return (
    <motion.button
      layout
      type="button"
      className={`acet-stateful-button ${status === "success" ? "is-success" : ""} ${className}`.trim()}
      whileTap={isDisabled ? undefined : {scale: 0.985}}
      disabled={isDisabled}
      {...props}
    >
            <span className="acet-stateful-button-inner">
                <AnimatePresence mode="wait" initial={false}>
                    {status === "loading" ? (
                      <motion.span
                        key="loading"
                        initial={{opacity: 0, scale: 0.8}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.8}}
                        className="acet-stateful-button-icon"
                      >
                        <LoaderCircle size={16} className="acet-stateful-button-spinner"/>
                      </motion.span>
                    ) : status === "success" ? (
                      <motion.span
                        key="success"
                        initial={{opacity: 0, scale: 0.8}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.8}}
                        className="acet-stateful-button-icon"
                      >
                        <Check size={16}/>
                      </motion.span>
                    ) : null}
                </AnimatePresence>
                <span>{children}</span>
            </span>
    </motion.button>
  );
}
