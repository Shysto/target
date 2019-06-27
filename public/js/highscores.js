$("#btnSearch").on("click", function() {
    const login = $("#inpLogin").val();
    const url = "/highscores/"+login;
    window.location.href = url;
});