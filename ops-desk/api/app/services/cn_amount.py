from __future__ import annotations

_DIGITS = "零壹贰叁肆伍陆柒捌玖"
_UNITS = ("", "拾", "佰", "仟")
_SECTIONS = ("", "万", "亿")


def _section_to_cn(n: int) -> str:
    if n == 0:
        return ""
    s = ""
    unit_pos = 0
    zero = True
    while n > 0:
        d = n % 10
        if d == 0:
            if not zero:
                s = _DIGITS[0] + s
                zero = True
        else:
            s = _DIGITS[d] + _UNITS[unit_pos] + s
            zero = False
        unit_pos += 1
        n //= 10
    return s


def rmb_upper(amount: float) -> str:
    """人民币大写，如 400000 -> 人民币肆拾万元整。"""
    if amount < 0:
        raise ValueError("amount must be >= 0")
    # work in fen
    fen = int(round(amount * 100))
    yuan, rem = divmod(fen, 100)
    jiao, fen_only = divmod(rem, 10)

    if yuan == 0 and rem == 0:
        return "人民币零元整"

    parts = []
    section_idx = 0
    need_zero = False
    y = yuan
    while y > 0:
        section = y % 10000
        if section != 0:
            sec_cn = _section_to_cn(section)
            if need_zero:
                parts.append(_DIGITS[0])
            parts.append(sec_cn + _SECTIONS[section_idx])
            need_zero = False
        else:
            if parts:
                need_zero = True
        y //= 10000
        section_idx += 1

    yuan_cn = "".join(reversed(parts)) if parts else _DIGITS[0]
    # fix patterns like 壹拾 -> 拾 for 10-19 in section? keep bank style 壹拾
    out = f"人民币{yuan_cn}元"
    if rem == 0:
        out += "整"
    else:
        if jiao:
            out += f"{_DIGITS[jiao]}角"
        else:
            out += "零"
        if fen_only:
            out += f"{_DIGITS[fen_only]}分"
        elif jiao:
            out += "整"
    return out
