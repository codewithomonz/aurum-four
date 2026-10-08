import { motion } from 'framer-motion';
import { AvatarIcon } from '../../components/AvatarIcon';
import { Button } from '../../components/Button';
import { DiscFace } from '../../components/DiscFace';
import { BRAND } from '../../config';
import { PLAYER_IDS } from '../../game/constants';
import { otherPlayer } from '../../game/logic';
import type { PlayerId } from '../../game/types';
import { useGameStore } from '../../store/useGameStore';
import {
  AVATAR_KEYS,
  AVATAR_LABELS,
  COLOR_KEYS,
  DISC_COLORS,
  discBackground,
} from '../../theme/palette';

const HERO_DISCS = [0, 1, 2, 3];

function PlayerSetupCard({ id }: { id: PlayerId }) {
  const profile = useGameStore((s) => s.players[id]);
  const otherColor = useGameStore((s) => s.players[otherPlayer(id)].color);
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const nameId = `player-${id}-name`;

  return (
    <section aria-labelledby={`player-${id}-title`} className="glass rounded-card p-5 text-left">
      <header className="flex items-center gap-3">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-black/75"
          style={{ background: discBackground(profile.color) }}
        >
          <AvatarIcon name={profile.avatar} className="h-6 w-6" />
        </span>
        <h2 id={`player-${id}-title`} className="text-base font-semibold">
          Player {id}
        </h2>
      </header>

      <label htmlFor={nameId} className="mt-5 block text-sm font-medium">
        Name
      </label>
      <input
        id={nameId}
        type="text"
        maxLength={14}
        autoComplete="off"
        value={profile.name}
        placeholder={`Player ${id}`}
        onChange={(event) => updatePlayer(id, { name: event.target.value })}
        className="mt-1.5 h-11 w-full rounded-xl border border-line bg-surface-2/80 px-3 text-base text-ink placeholder:text-muted focus:border-primary"
      />

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Disc color</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {COLOR_KEYS.map((key) => {
            const taken = key === otherColor;
            return (
              <label key={key} className="relative cursor-pointer">
                <input
                  type="radio"
                  name={`color-${id}`}
                  value={key}
                  checked={profile.color === key}
                  disabled={taken}
                  onChange={() => updatePlayer(id, { color: key })}
                  className="peer sr-only"
                />
                <span
                  className="block h-11 w-11 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-surface transition peer-checked:ring-accent peer-focus-visible:ring-ink peer-disabled:opacity-30"
                  style={{ background: discBackground(key) }}
                />
                <span className="sr-only">
                  {DISC_COLORS[key].label}
                  {taken ? ' (chosen by the other player)' : ''}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Avatar</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {AVATAR_KEYS.map((key) => (
            <label key={key} className="relative cursor-pointer">
              <input
                type="radio"
                name={`avatar-${id}`}
                value={key}
                checked={profile.avatar === key}
                onChange={() => updatePlayer(id, { avatar: key })}
                className="peer sr-only"
              />
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface-2 text-muted transition peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ink">
                <AvatarIcon name={key} className="h-5 w-5" />
              </span>
              <span className="sr-only">{AVATAR_LABELS[key]}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}

export function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 pb-10 pt-4 text-center outline-none"
    >
      <div aria-hidden="true" className="mb-7 flex gap-3">
        {HERO_DISCS.map((i) => (
          <motion.div
            key={i}
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12 * i, type: 'spring', stiffness: 220, damping: 14 }}
          >
            <div className="animate-float" style={{ animationDelay: `${i * 0.4}s` }}>
              <DiscFace color="gold" glow className="h-11 w-11 sm:h-14 sm:w-14" />
            </div>
          </motion.div>
        ))}
      </div>

      <h1 className="font-display text-display font-bold text-gold">{BRAND.name}</h1>
      <p className="mt-3 max-w-md text-lg text-muted">{BRAND.tagline}</p>

      <div className="mt-10 grid w-full gap-5 md:grid-cols-2">
        {PLAYER_IDS.map((id) => (
          <PlayerSetupCard key={id} id={id} />
        ))}
      </div>

      <Button className="mt-10 min-w-56 text-base" onClick={startGame}>
        Start game
      </Button>
      <p className="mt-4 max-w-sm text-sm text-muted">
        Two players share this screen. Take turns dropping discs and connect four in any direction.
      </p>
    </main>
  );
}