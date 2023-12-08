const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

export function toLocaleDateString(date: Date) {
    if (!date) return '';
    return date.toLocaleDateString('zh-cn', options);
}
