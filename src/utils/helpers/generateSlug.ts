interface SlugOptions {
    seperator?: string;
    lowerCase?: boolean;
    upperCase?: boolean;
    length?: number;
    trim?: boolean;
    timestamp?: boolean;
    trimBySepator?: number;
    removeSpecialCharacters?: boolean;
}

export const generateSlug = (text: string, options?: SlugOptions) => {

    options?.removeSpecialCharacters ? text = text.replace(/[^\w ]/g, '') : text;
    var slug: string = text;
    let date = new Date();

    options?.trim ? slug = slug.replace(/^\s+|\s+$/gm, '') : slug;
    options?.lowerCase ? slug = slug.toLowerCase() : slug;
    options?.upperCase ? slug = slug.toUpperCase() : slug;
    options?.length ? slug = slug.substring(0, options.length) : slug;
    options?.timestamp ? slug = slug + `-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}` : slug;

    slug = options?.seperator ? slug.replace(/ /g, options?.seperator) : slug.replace(/ /g, '-');

    if (options?.trimBySepator) {
        let trimIndex = options?.trimBySepator;
        const indexes = findIndexes(slug, !options?.seperator ? '-' : options?.seperator);
        if (indexes.length > trimIndex) {
            slug = slug.substring(0, indexes[trimIndex - 1]);
        }
    }

    return slug;
}

const findIndexes = (text: string, letter: string) => {
    return text
        .split('')
        .map((c, idx) => {
            if (c === letter) {
                return idx;
            }
            return -1;
        })
        .filter(element => element !== -1);
}