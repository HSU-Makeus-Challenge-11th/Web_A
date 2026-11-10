console.log("Hello, Web!");
    
        const student = {
            name: "경수",
            skills: ["HTML", "CSS", "JavaScript"],
        };

        function printSkills(skills) {
            for (const skill of skills) {
                if (skill === "JavaScript") {
                    console.log(`${skill}: 화면에 동작을 더합니다.`);
                } else {
                    console.log(skill);
                }
            }
        }

        console.log(student.name);
        printSkills(student.skills);

        const message = document.querySelector("#message");
        const greetingButton = document.querySelectoy("#greeting-button");

        greetingButton.addEventListener("click", function () {      /*이벤트 핸들러 - 클릭 이벤트가 발생할 때 실행할 함수.*/
            message.textContent = "웹 개발을 시작합니다!";             /*화면의 텍스트를 변경*/
        }); 