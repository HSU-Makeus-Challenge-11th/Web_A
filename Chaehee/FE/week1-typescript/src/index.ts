type Role = "스터디장" | "MC" | "팀원";
 
interface Member {
  id: number;
  name: string;
  role: Role;
  githubId?: string;
}
 
const members: Member[] = [
  { id: 1, name: "신채희", role: "팀원", githubId: "hee0543" },
  { id: 2, name: "차현우", role: "스터디장", githubId: "cha-hyunwoo" },
  { id: 3, name: "신진용", role: "MC"},
];
 
function findMember<T extends { id: number }>(list: T[], id: number): T | undefined {
  return list.find((item) => item.id === id);
}
 
function getMemberIntro(id: number): string {
  const member = findMember(members, id);
 
  if (member === undefined) {
    return `${id}번 회원은 존재하지 않습니다.`;
  }
 
  const githubText = member.githubId ?? "GitHub 미등록";
  return `${member.name}(${member.role}) - GitHub: ${githubText}`;
}
 
console.log(getMemberIntro(1));
console.log(getMemberIntro(2));
console.log(getMemberIntro(999));
 