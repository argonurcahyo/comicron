type CharacterReference = {
  id: string;
  name: string;
  alias?: string | null;
};

type CharacterMention = {
  raw: string;
  display: string;
  name: string;
  normalized: string;
};

const BRACKET_MENTION_REGEX = /@\[([^\]]+)\]/g;
const SIMPLE_MENTION_REGEX = /(^|[^\w/])@([a-z0-9][a-z0-9_-]*)/gi;

function normalizeMentionName(value: string): string {
  return value.trim().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function normalizeMentionKey(value: string): string {
  return normalizeMentionName(value).toLowerCase();
}

function pushMention(target: CharacterMention[], raw: string, display: string, name: string) {
  const normalized = normalizeMentionKey(name);
  if (!normalized) {
    return;
  }

  target.push({
    raw,
    display,
    name: normalizeMentionName(name),
    normalized,
  });
}

function buildCharacterReferenceMap(characters: CharacterReference[]): Map<string, CharacterReference> {
  const characterMap = new Map<string, CharacterReference>();

  for (const character of characters) {
    const nameKey = normalizeMentionKey(character.name);
    if (nameKey && !characterMap.has(nameKey)) {
      characterMap.set(nameKey, character);
    }

    const aliasKey = normalizeMentionKey(character.alias ?? "");
    if (aliasKey && !characterMap.has(aliasKey)) {
      characterMap.set(aliasKey, character);
    }
  }

  return characterMap;
}

function getPreferredMentionName(character: CharacterReference): string {
  return normalizeMentionName(character.alias?.trim() || character.name);
}

export function extractCharacterMentions(markdown: string): CharacterMention[] {
  if (!markdown.trim()) {
    return [];
  }

  const mentions: CharacterMention[] = [];

  for (const match of markdown.matchAll(BRACKET_MENTION_REGEX)) {
    const name = match[1] ?? "";
    pushMention(mentions, match[0], `@[${name}]`, name);
  }

  for (const match of markdown.matchAll(SIMPLE_MENTION_REGEX)) {
    const name = match[2] ?? "";
    pushMention(mentions, `${match[1] ?? ""}@${name}`, `@${name}`, name);
  }

  const deduped = new Map<string, CharacterMention>();
  for (const mention of mentions) {
    if (!deduped.has(mention.normalized)) {
      deduped.set(mention.normalized, mention);
    }
  }

  return Array.from(deduped.values());
}

export function formatCharacterMention(name: string): string {
  const normalized = normalizeMentionName(name);
  if (!normalized) {
    return "";
  }

  return normalized.includes(" ") ? `@[${normalized}]` : `@${normalized}`;
}

export function canonicalizeSummaryMentions(
  markdown: string,
  characters: CharacterReference[],
): {
  markdown: string;
  unresolvedMentions: CharacterMention[];
} {
  if (!markdown.trim()) {
    return { markdown, unresolvedMentions: [] };
  }

  const characterMap = buildCharacterReferenceMap(characters);
  const unresolved = new Map<string, CharacterMention>();
  const rememberUnresolved = (mention: CharacterMention) => {
    if (!unresolved.has(mention.normalized)) {
      unresolved.set(mention.normalized, mention);
    }
  };

  let nextMarkdown = markdown.replace(BRACKET_MENTION_REGEX, (raw, name: string) => {
    const normalized = normalizeMentionName(name);
    const mention: CharacterMention = {
      raw,
      display: `@[${name}]`,
      name: normalized,
      normalized: normalizeMentionKey(name),
    };
    const match = characterMap.get(mention.normalized);
    if (match) {
      return formatCharacterMention(getPreferredMentionName(match));
    }

    rememberUnresolved(mention);
    return formatCharacterMention(normalized);
  });

  nextMarkdown = nextMarkdown.replace(SIMPLE_MENTION_REGEX, (raw, prefix: string, name: string) => {
    if (prefix === "[") {
      return raw;
    }

    const normalized = normalizeMentionName(name);
    const mention: CharacterMention = {
      raw,
      display: `@${name}`,
      name: normalized,
      normalized: normalizeMentionKey(name),
    };
    const match = characterMap.get(mention.normalized);
    if (match) {
      return `${prefix}${formatCharacterMention(getPreferredMentionName(match))}`;
    }

    rememberUnresolved(mention);
    return `${prefix}${formatCharacterMention(normalized)}`;
  });

  return {
    markdown: nextMarkdown,
    unresolvedMentions: Array.from(unresolved.values()),
  };
}

export function renderSummaryWithCharacterLinks(
  markdown: string,
  characters: CharacterReference[],
): string {
  if (!markdown.trim()) {
    return markdown;
  }

  const characterMap = buildCharacterReferenceMap(characters);

  let nextMarkdown = markdown.replace(BRACKET_MENTION_REGEX, (raw, name: string) => {
    const match = characterMap.get(normalizeMentionKey(name));
    if (!match) {
      return raw;
    }

    return `[@${getPreferredMentionName(match)}](/characters/${match.id})`;
  });

  nextMarkdown = nextMarkdown.replace(SIMPLE_MENTION_REGEX, (raw, prefix: string, name: string) => {
    if (prefix === "[") {
      return raw;
    }

    const match = characterMap.get(normalizeMentionKey(name));
    if (!match) {
      return raw;
    }

    return `${prefix}[@${getPreferredMentionName(match)}](/characters/${match.id})`;
  });

  return nextMarkdown;
}

export function renderSummaryWithPreferredMentions(
  markdown: string,
  characters: CharacterReference[],
): string {
  if (!markdown.trim()) {
    return markdown;
  }

  const characterMap = buildCharacterReferenceMap(characters);

  let nextMarkdown = markdown.replace(BRACKET_MENTION_REGEX, (raw, name: string) => {
    const match = characterMap.get(normalizeMentionKey(name));
    if (!match) {
      return raw;
    }

    return formatCharacterMention(getPreferredMentionName(match));
  });

  nextMarkdown = nextMarkdown.replace(SIMPLE_MENTION_REGEX, (raw, prefix: string, name: string) => {
    if (prefix === "[") {
      return raw;
    }

    const match = characterMap.get(normalizeMentionKey(name));
    if (!match) {
      return raw;
    }

    return `${prefix}${formatCharacterMention(getPreferredMentionName(match))}`;
  });

  return nextMarkdown;
}