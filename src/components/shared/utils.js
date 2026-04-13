const AVATAR_COLORS = [
    { bg: '#EEEDFE', color: '#3C3489' }, // purple
    { bg: '#E1F5EE', color: '#085041' }, // teal
    { bg: '#E6F1FB', color: '#0C447C' }, // blue
    { bg: '#FAECE7', color: '#993C1D' }, // coral
    { bg: '#FBEAF0', color: '#72243E' }, // pink
    { bg: '#FAEEDA', color: '#633806' }, // amber
];

export function avatarStyle(index) {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function agentInitials(name) {
    if (!name) return '';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
