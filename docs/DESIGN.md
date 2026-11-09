# DESIGN.md: Galmee Rentals

Change this file first, then the code.

## Brief

- **Subject:** the row of rented rooms and shops around a compound in Shashamane. Gates and doors painted deep teal, a limewashed wall, a landlord's ledger of who has paid.
- **Audience:** the owner or rent collector, on a cheap phone, one thumb, often standing at a tenant's door.
- **Primary job:** see who is late and take the rent.

## Colour

| Token | Hex | Role |
| --- | --- | --- |
| `--gate` | `#0F4C5C` | Dominant. Header, primary action, occupied doors. White on it is 9.8:1. |
| `--limewash` | `#EEF2F1` | Page background. |
| `--rule` | `#CBD5D3` | Borders and hairlines. |
| `--key` | `#A56A00` | Brass key. Rent due soon, prepaid rent, the door handle. 4.6:1 on white. |
| `--late` | `#B3261E` | Late rent, errors. 6.5:1 on white. |
| `--ink` | `#142326` | Text. |

Status is never colour alone: a late door carries a "!" and the word "late", a vacant door is a dashed outline with the word "vacant", and money always says owes, late or prepaid.

## Type

- **Fira Sans** (English and Afaan Oromo): drawn for small screens, open shapes and tabular figures. Numbers use tabular figures (`.num`).
- **Noto Sans Ethiopic** for Amharic, 400/600.
- Self-hosted with `next/font/local`.
- Scale: 14 / 16 / 20 / 24.

## The one bold thing

The **door row**: every property is one row of doors, one door per unit, numbered like the doors in the compound. Filled teal is occupied, a red door with "!" is late, a dashed outline is vacant. Tap a door to open that tenant or to move someone in. Everything else stays quiet.

## Layout (360 px first)

```
+----------------------------+
| [door] Business  [lang][x] |  gate header
+----------------------------+
| 22 of 30 let  3 late       |
| [ search tenant or door ]  |
| All | Vacant | Late        |
+----------------------------+
| Bole Compound              |
| [1][2][3!][ ][5]           |  door row
| Hawi Tufa, door 3          |
|   late 2 months  ETB 6,000 |
+----------------------------+
| Doors Late Rent Broker Setup |
```

Checked against the generic defaults: no cream and terracotta, no gradient washes, no identical rounded shadow cards, no all-caps eyebrow labels.
