import { Languages, Check, CircleDot, Circle } from 'lucide-react';

/**
 * Left-hand branded panel shared by the auth screens (login, signup).
 * Always dark, hidden below the `lg` breakpoint.
 */
export function AuthBrandPanel() {
  return (
    <div className="relative hidden w-[44%] max-w-[600px] flex-col justify-between overflow-hidden bg-[#0a0a0b] p-14 lg:flex">
      <div
        className="pointer-events-none absolute -top-20 left-60 h-[420px] w-[560px] rounded-full bg-brand/25 blur-3xl"
        aria-hidden
      />
      {/* Logo */}
      <div className="relative flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand">
          <Languages className="h-[18px] w-[18px] text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold text-zinc-50">Kotomot</p>
          <p className="text-[11px] text-zinc-400">Translation Platform</p>
        </div>
      </div>

      {/* Pitch */}
      <div className="relative flex w-full max-w-[440px] flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold leading-[1.15] tracking-tight text-zinc-50">
            Ship every language, faster.
          </h1>
          <p className="text-[15px] leading-relaxed text-zinc-400">
            Manage translation keys across projects, locales, versions and environments — in one
            calm workspace.
          </p>
        </div>

        {/* Mini translation card preview */}
        <div className="flex w-[360px] max-w-full flex-col gap-3 rounded-[10px] border border-zinc-800 bg-[#131316] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-50">auth.login.title</span>
            <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
              In review
            </span>
          </div>
          {[
            { n: 'fr · French', icon: Check, c: 'text-success' },
            { n: 'de · German', icon: Check, c: 'text-success' },
            { n: 'es · Spanish', icon: CircleDot, c: 'text-warning' },
            { n: 'ja · Japanese', icon: Circle, c: 'text-zinc-500' },
          ].map(({ n, icon: Icon, c }) => (
            <div key={n} className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">{n}</span>
              <Icon className={`h-3.5 w-3.5 ${c}`} />
            </div>
          ))}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div className="h-1.5 rounded-full bg-brand" style={{ width: '70%' }} />
          </div>
        </div>
      </div>

      <p className="relative text-xs text-zinc-500">
        Trusted by teams localizing into 40+ languages.
      </p>
    </div>
  );
}

export default AuthBrandPanel;
