declare namespace Intl {
  interface PluralRulesOptions {
    roundingPriority?: Intl.NumberFormatOptions["roundingPriority"],
    roundingIncrement?: Intl.NumberFormatOptions["roundingIncrement"],
    roundingMode?: Intl.NumberFormatOptions["roundingMode"],
    trailingZeroDisplay?: Intl.NumberFormatOptions["trailingZeroDisplay"]
  }

  interface PluralRules {
    selectRange(start: number, end: number): LDMLPluralRule;
  }
}
