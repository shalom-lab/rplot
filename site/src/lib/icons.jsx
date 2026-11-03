export function IconSearch({ className = "size-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

export function IconGear({ className = "size-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
      <path
        fillRule="evenodd"
        d="M7.1 1.2a1 1 0 011.8 0l.2.5a5.6 5.6 0 011.5.6l.5-.2a1 1 0 011.3.5l.4.8a1 1 0 01-.3 1.2l-.3.3c.1.5.1 1 .1 1.5l.3.3a1 1 0 01.3 1.2l-.4.8a1 1 0 01-1.3.5l-.5-.2a5.6 5.6 0 01-1.5.6l-.2.5a1 1 0 01-1.8 0l-.2-.5a5.6 5.6 0 01-1.5-.6l-.5.2a1 1 0 01-1.3-.5l-.4-.8a1 1 0 01.3-1.2l.3-.3a5.7 5.7 0 01-.1-1.5l-.3-.3a1 1 0 01-.3-1.2l.4-.8a1 1 0 011.3-.5l.5.2a5.6 5.6 0 011.5-.6l.2-.5zM8 10.2a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4z"
      />
    </svg>
  );
}

export function IconStar({ filled = false, className = "size-3.5" }) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M8 1.5l1.7 3.5 3.8.6-2.7 2.7.6 3.8L8 10.3l-3.4 1.8.6-3.8L2.5 5.6l3.8-.6L8 1.5z" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M8 2.2l1.5 3.1 3.4.5-2.5 2.4.6 3.4L8 9.9 4.9 11.6l.6-3.4L3 5.8l3.4-.5L8 2.2z" />
    </svg>
  );
}

/** Official GitHub Mark (octocat silhouette) */
export function IconGitHub({ className = "size-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function IconX({ className = "size-4" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function IconSpinner({ className = "size-3.5" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
