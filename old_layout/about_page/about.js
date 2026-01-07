const members = [
    {
        name:"Lukas Mathesius",
        email:"matheluk001@gmail.com",
        username:"matheluk",
        commits:"lukas-commits",
        issues:"lukas-issues",
    },
    {
        name:"Ameera Habib",
        email:"amh8992@utexas.edu",
        username:"amh8992",
        commits:"ameera-commits",
        issues:"ameera-issues",
    },
    {
        name:"Angel O Ogungbemi",
        email:"angel-ogungbemi@utexas.edu",
        username:"angel-ogungbemi",
        commits:"angel-commits",
        issues:"angel-issues",
    },
    {
        name:"Gora Bepary",
        email:"gorabep@gmail.com",
        username:"gorabep",
        commits:"gora-commits",
        issues:"gora-issues",
    },
    {
        name:"Danyal Saeed",
        email:"cherrylotter@gmail.com",
        username:"das-codez",
        commits:"danyal-commits",
        issues:"danyal-issues",
    }
];

async function fetchCommits(name){
    let total_commits = [];
    for (let page = 1; page <= 10; page++){
        const response = await fetch(`https://gitlab.com/api/v4/projects/74752183/repository/commits?&per_page=100&page=${page}`);
        const data = await response.json();
        if (data.length == 0){
            break;
        }
        total_commits = total_commits.concat(data);
    }
    let count = 0;
    for (const commit of total_commits){
        if (commit["author_name"] === name){
            count++;
        }
    }
    return count;
}

async function fetchIssues(username){
    let total_issues = [];
    for (let page = 1; page <= 10; page++){
        const response = await fetch(`https://gitlab.com/api/v4/projects/74752183/issues?state=closed&per_page=100&page=${page}`);
        const data = await response.json();
        if (data.length == 0){
            break;
        }
        total_issues = total_issues.concat(data);
    }
    let count = 0;
    for (const issue of total_issues){
        if (issue["closed_by"]["username"] === username){
            count++;
        }
    }
    return count;
    
}

async function setAmounts(){
    for (const member of members){
        try{
            const commits = await fetchCommits(member.name);
            document.getElementById(member.commits).innerText = commits;
        }catch{
            document.getElementById(member.commits).innerText = "None";

        }
        try{
            const issues = await fetchIssues(member.username);
            document.getElementById(member.issues).innerText = issues;
        }catch{
            document.getElementById(member.issues).innerText = "None";

        }
    }
}
document.addEventListener("DOMContentLoaded", setAmounts);