/*
 * スポンサーデータ管理ファイル
 * 手動で更新する形でスポンサー名を管理します
 * 各プランのsponsorsの配列にスポンサー名を追加してください
 */

export interface SponsorPlan {
  id: string;
  name: string;
  emoji: string;
  description: string;
  imageUrl: string;
  bgColor: string;
  borderColor: string;
  tagColor: string;
  sponsors: string[]; // スポンサー名のリスト（手動更新）
}

export const sponsorPlans: SponsorPlan[] = [
  {
    id: "toilet-paper",
    name: "お尻セレブ",
    emoji: "🌸",
    description: "ちょっと良いトイレットペーパーをドームに届けます",
    imageUrl: "https://private-us-east-1.manuscdn.com/sessionFile/TMtHNJuybMW5agjlntD4SZ/sandbox/t32Gdn5s1oZeSw8lyg0EW9_1771806201014_na1fn_dG9pbGV0LXBhcGVyLWlsbHVzdA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVE10SE5KdXliTVc1YWdqbG50RDRTWi9zYW5kYm94L3QzMkdkbjVzMW9aZVN3OGx5ZzBFVzlfMTc3MTgwNjIwMTAxNF9uYTFmbl9kRzlwYkdWMExYQmhjR1Z5TFdsc2JIVnpkQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=kYUbKqumOuI6GKM8KD-tIntmypZ-Hha0Aq9qqVRE4uNx5nPoKKilv6xd1BrAP7zco7CNr0jxkhFMtlLH9oCgE3csYaX9v2YwYQcdDyxOKdXUJGhd0nX15pje0fG0pMsuQzq3Nyxm7mf5rggLVZcTaiQFbUreB6gs1zgy8GVewmFYNwpR50GoCXYpmnTELFgre5ftJ9jcXZIGntBUpG~PvH1Jr~6HyiySf2YryhTqmiOdHPZT0XQkO3W3qLbIRmXzcDqt~IjqLgCMfFmlNuQogGb4b70a1P0klLfCnUEVYtMgMuRgXNz7NJ8uJFa9hcUkl5IdMjzBpECyre5FF8MNwQ__",
    bgColor: "#FFF5F0",
    borderColor: "#F4C5A0",
    tagColor: "#E8865A",
    sponsors: [], // ← ここにスポンサー名を追加: ["田中さん", "山田さん"]
  },
  {
    id: "miso-soup",
    name: "お味噌汁",
    emoji: "🍵",
    description: "来場者みんなに温かいお味噌汁を振る舞います",
    imageUrl: "https://private-us-east-1.manuscdn.com/sessionFile/TMtHNJuybMW5agjlntD4SZ/sandbox/t32Gdn5s1oZeSw8lyg0EW9_1771806201015_na1fn_bWlzby1zb3VwLWlsbHVzdA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVE10SE5KdXliTVc1YWdqbG50RDRTWi9zYW5kYm94L3QzMkdkbjVzMW9aZVN3OGx5ZzBFVzlfMTc3MTgwNjIwMTAxNV9uYTFmbl9iV2x6YnkxemIzVndMV2xzYkhWemRBLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=A6xqcgawygxlLQ24G7bHjGuFJTqBXCI8XGgMnMRsBv0AialrDusbgEIRYFhqDgkzQA10uaoMeqSNNtbGYSrraLDMh-SJK-j1EKP6zwf9B2MX9wCbfb~kIYNqo7W3X9v5Fyi-21SHAnAF5afVcVxoXI9m8nr3XJd~nUy-kQ7CfsdCcPrXGPvcYtdPFHn6TeFvP28GW4McGg9YUh8wdF5H~M53OXS4DwvICVUoCocHAw9DxKZeGHMkJ7S87HbKk-o6JpnHDQ7LDXI8VA~uFARc2tRAJRr7i6bLaiGCVNJG7COpO07bnQpKEw9v-54eHB0ajdhk8Hqu9y1ITVbLfEn2xw__",
    bgColor: "#F5FFF5",
    borderColor: "#A8D5A0",
    tagColor: "#5A9E5A",
    sponsors: [], // ← ここにスポンサー名を追加
  },
  {
    id: "stove",
    name: "暖房・薪",
    emoji: "🔥",
    description: "冬のドームを薪ストーブで温めます",
    imageUrl: "https://private-us-east-1.manuscdn.com/sessionFile/TMtHNJuybMW5agjlntD4SZ/sandbox/t32Gdn5s1oZeSw8lyg0EW9_1771806201015_na1fn_c3RvdmUtaWxsdXN0.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVE10SE5KdXliTVc1YWdqbG50RDRTWi9zYW5kYm94L3QzMkdkbjVzMW9aZVN3OGx5ZzBFVzlfMTc3MTgwNjIwMTAxNV9uYTFmbl9jM1J2ZG1VdGFXeHNkWE4wLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=oaFpLSD6rUA-1HtUYP0VER9M4f5RHDVSqje2sdSILumjKHzMKXESZ-Xyb6FndbLSIjeXXHpCn5HyA0BHUoSEwMD3V0GZ3jXrj9SSRT6QrMPtt4ls4Z8QPVvAAzX2IZk6UnoOQ7a7S1pF7bJHpHlKDwn-RKzxTumhONSrcI2kIbQfI1j2JqIaO7sqUmpuTvZBFEl0Jyirlu8KBwx4KXY8eAjr4lS9th8cqlcOCXQA6dSVQbEPsz8X1H0bPDk4mQ8AOeCUYJRhSoWloUnUgqCbU8LE44gh3kyljizhwPyrmYYbXC5edK3I2iCsaCLj~8c~uH-Aqslw4TGw3k~attTrXQ__",
    bgColor: "#FFF8F0",
    borderColor: "#F0C080",
    tagColor: "#C87820",
    sponsors: [], // ← ここにスポンサー名を追加
  },
  {
    id: "tea",
    name: "ちょっと良いお茶",
    emoji: "🍃",
    description: "ちょっと良いお茶でほっとひと息",
    imageUrl: "https://private-us-east-1.manuscdn.com/sessionFile/TMtHNJuybMW5agjlntD4SZ/sandbox/OA4FlQT63etW3f430grp1Z_1771806252536_na1fn_dGVhLWlsbHVzdA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVE10SE5KdXliTVc1YWdqbG50RDRTWi9zYW5kYm94L09BNEZsUVQ2M2V0VzNmNDMwZ3JwMVpfMTc3MTgwNjI1MjUzNl9uYTFmbl9kR1ZoTFdsc2JIVnpkQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=WVd5JwThpMPEd4SEIBfVfx5dP4cu0CpluYY6BXFRyTuuF2qAuobmHb6xnF4LLnkf2Ap3gtlxe-Cj0JnkuRIi0wCbDJtgVU6fz6VS3SaV-rJKYZPH8omPqaKMaY6A51nPbWgwW7bBCKX5oY2V7hIjD56mQPhwsxZpIcpQs9s-paiY~cbvYLHq9W0fvx08b~fBkc6o4t7HiaPii7vCXgbYP~GgwBS92I2e2kyskBR-Nlr7LTBT8L91zBA0SaRqIfkVxkChFccUglS0k2F0~IN6orNcgXMk0dDorMrwFXJt5iRBqOS7z9GYYKpQNT~WRBueCiTnCX06pWbrjg9-mQ5Vbw__",
    bgColor: "#F5FFF8",
    borderColor: "#A0D5B0",
    tagColor: "#3A8A5A",
    sponsors: [], // ← ここにスポンサー名を追加
  },
];
