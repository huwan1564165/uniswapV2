const {expect} = require("chai")
const {ethers} = require("hardhat")

describe("测试数组练习合约", async function(){
    let owner,addr1
    let ownerAddress;
    let ArrayBasics
    let arrayBasics
    let StudentGrades
    let studentGrades
    let TodoList
    let todoList
    let VotingSystem
    let votingSystem


    this.beforeEach(async function () {
        [owner,addr1] = await ethers.getSigners();
        ownerAddress = await owner.getAddress();

        ArrayBasics = await ethers.getContractFactory("ArrayBasics")
        arrayBasics = await ArrayBasics.deploy()
        await arrayBasics.waitForDeployment()

        StudentGrades = await ethers.getContractFactory("StudentGrades")
        studentGrades = await StudentGrades.deploy()
        await studentGrades.waitForDeployment()

        TodoList = await ethers.getContractFactory("TodoList")
        todoList = await TodoList.deploy()
        await todoList.waitForDeployment()

        VotingSystem = await ethers.getContractFactory("VotingSystem")
        votingSystem = await VotingSystem.deploy()
        await votingSystem.waitForDeployment()
    })

    it("ArrayBasics合约测试",async function(){
        // 添加数字到数组
        await arrayBasics.addNumber(10);
        await arrayBasics.addNumber(20);
        //获取数组长度
        const length = await arrayBasics.getLength();
        //验证数组长度是否正确
        expect(length).to.be.equals(2);
        //获取指定索引元素
        const index = await arrayBasics.getNumber(0);
        //验证获取的指定索引元素是否正确
        expect(index).to.be.equals(10);
        //删除最后一个元素
        await arrayBasics.removeLast();
        //验证数组长度是否正确
        expect(await arrayBasics.getLength()).to.be.equals(1);
    })
    it("StudentGrades合约测试",async function(){
        // 添加学生
        await studentGrades.addStudent("小明",86);
        await studentGrades.addStudent("小张",75);
        await studentGrades.addStudent("小美",99);
        //计算平均分
        const average = await studentGrades.calculateAverage();
        expect(average).to.be.equals((86n+75n+99n)/3n)
        // 查找最高分
        const [student,grade] = await studentGrades.findHighest();
        expect(grade).to.be.equals(99n)
        expect(student).to.be.equals("小美")
        
    })
    it("TodoList合约测试",async function(){
        // 添加待办事项
        await todoList.addTodo("每天必须喝1L的水");
        await todoList.addTodo("早上8点起");
        await todoList.addTodo("晚上10点睡");
        //标记完成
        await todoList.completeTodo(1);
        // 获取未完成的任务数量
        const pendingCount =await todoList.getPendingCount();
        expect(pendingCount).to.be.equals(2)
    })
    it("VotingSystem合约测试",async function(){
        const candidate0 = ["小明","小张","小美"]
        const votes0 = [1n,0n,2n]
        // 添加候选人
        await votingSystem.addCandidate("小明");
        await votingSystem.addCandidate("小张");
        await votingSystem.addCandidate("小美");
        //投票
        await votingSystem.vote(2);
        await votingSystem.vote(0);
        await votingSystem.vote(2);
        //获取所有候选人票数
        const [candidate1,votes1] = await votingSystem.getAllVotes();
        
        for(var i=0;i<candidate0.length;i++){
            expect(candidate1[i]).to.be.equals(candidate0[i])
        }
        for(var i=0;i<candidate0.length;i++){
            expect(votes1[i]).to.be.equals(votes0[i])
        }
        
    })
})