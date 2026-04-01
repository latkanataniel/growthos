import type { Task, TeamMember, Profile } from '@/types/database'

export function buildDelegationPrompt(
  task: Task,
  profile: Profile,
  teamMembers: TeamMember[]
): string {
  const teamList = teamMembers
    .map(
      (m) =>
        `- ${m.name} (${m.role || 'brak roli'}): umiejętności: ${m.skills?.join(', ') || 'brak'}, dział: ${m.department || 'brak'}, dostępność: ${m.availability || 'nieznana'}`
    )
    .join('\n')

  return `Jesteś asystentem zarządzania zadaniami. Przeanalizuj poniższe zadanie i zdecyduj, czy powinno zostać delegowane.

## Profil użytkownika
- Rola: ${profile.role || 'nie określona'}
- Umiejętności: ${profile.skills?.join(', ') || 'nie określone'}
- Cele: ${profile.goals || 'nie określone'}
- Obowiązki: ${profile.responsibilities || 'nie określone'}

## Zadanie
- Tytuł: ${task.title}
- Opis: ${task.description || 'brak'}
- Kategoria: ${task.category}
- Priorytet: ${task.priority}
- Termin: ${task.due_date || 'brak'}
- Tagi: ${task.tags?.join(', ') || 'brak'}

## Zespół
${teamList || 'Brak członków zespołu'}

## Instrukcje
Odpowiedz TYLKO w formacie JSON (bez markdown):
{
  "should_delegate": true/false,
  "suggested_assignee": "imię osoby z zespołu lub null",
  "reasoning": "krótkie uzasadnienie po polsku (2-3 zdania)",
  "confidence": 0.0-1.0
}

Weź pod uwagę:
1. Czy zadanie pasuje do umiejętności i roli użytkownika?
2. Czy ktoś z zespołu byłby lepszym wykonawcą?
3. Czy użytkownik powinien skupić się na ważniejszych rzeczach?
4. Dostępność i obciążenie zespołu.`
}
