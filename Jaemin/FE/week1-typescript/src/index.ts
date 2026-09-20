type MemberRole = "leader" | "member";

type StudyMember = {
    id: number;
    name: string;
    role: MemberRole;
    githubId?: string;
};

const members: StudyMember[] = [
    {
        id: 1,
        name: "재민",
        role: "leader",
        githubId: "jmyoo0512",
    },
    {
        id: 2,
        name: "광수",
        role: "member",
    },
];

function getMemberInfo(id: number): string {
    const member = members.find((member) => member.id === id);
    if (!member) {
        return "회원을 찾을 수 없어요.";
    }

    const roleMessage = member.role === "leader" ? "스터디를 이끌어요." : "스터디에 참여해요.";
    const githubId = member.githubId ?? "등록되지 않음";

    return (member.name + " 님은 " + roleMessage + " GitHub: " + githubId);
}

console.log(getMemberInfo(1));
console.log(getMemberInfo(2));
console.log(getMemberInfo(999));