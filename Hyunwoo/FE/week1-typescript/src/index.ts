type MemberRole = "leader" | "member";

interface StudyMember {
    id: number;
    name: string;
    role: MemberRole;
    githubId?: string;
}

const members: StudyMember[] = [
    { id: 1, name: "현우", role: "leader", githubId: "cha-hyunwoo"},
    { id: 2, name: "진용", role: "member"},
    { id: 3, name: "채희", role: "member"},
    { id: 4, name: "재민", role: "member"}
]

function findMember(memberId: number) {
    const member = members.find(
        (member) => member.id === memberId
    );

    if(!member) {
        return "존재하지 않는 회원입니다.";
    }

    const githubId = member.githubId ?? "등록되지 않음";

    return `${member.name}님의 GitHub 아이디: ${githubId}`;
}

console.log(findMember(1));
console.log(findMember(2));
console.log(findMember(999));

type StudyMemberType = {
    id: number;
    name: string;
    role: MemberRole;
    githubId?: string;
};

const studyHour: number | undefined = 0;

console.log(studyHour || 1);
console.log(studyHour ?? 1);

function formatMemberId(input: unknown) {
    if(typeof input === "number") {
        return `회원 ID: ${input}`;
    }else if(typeof input === "string") {
        return `문자열 ID: ${input}`;
    }else{
        return "올바르지 않은 회원 ID입니다.";
    }
}

console.log(formatMemberId(1));
console.log(formatMemberId("member-01"));
console.log(formatMemberId(undefined));