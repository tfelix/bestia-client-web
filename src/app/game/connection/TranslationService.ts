export class TranslationService {

  private enTranslations = {
    'item.knife': 'Knife',
    'item.empty_bottle': 'Empty Bottle',
    'item.fish': 'Fish'
  };

  public translate(translateKeys: string[], callbackFn: (translation: any) => void) {
    const translated = {};
    translateKeys.forEach(key => {
      const t = this.enTranslations[key] || '???';
      translated[key] = t;
    });
    callbackFn(translated);
  }
}
