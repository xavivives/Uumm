var Uumm = artifacts.require("./Uumm.sol")
var Data = require("./TestData.js")
var Numeral = require("numeral")


const initialSateResults = {
    projectsLength : 0,
    projectId:0,
    proposalsLength:0,
    pendingProposalsLength:0,
    proposalDetails:
    {
        proposalId:"",
        author:"",
        title:0,
        reference:0,
        valueAmount:0,
        creationDate:0
    }
}

const nonexistentArguments = {
    ProjectId:"32bytesString",
    ProposalId:123,
    PendingProposalIndex:123
}

const errors = 
{
    VmException:"Uncaught Error: Error: VM Exception while executing eth_call: invalid opcode",
    InvalidOpcode:"Error: VM Exception while executing eth_call: invalid opcode"
}

const firstProject =
{
    name:"First Project Name",
    projectsLength:1,
}

const firstProposal=
{
    title:"First proposal title",
    reference:"ProposalReference",
    valueAmount:10,
    id:0,
    proposalsLength:1,
    state:0
}

const expectedGasUsed=
{
    voteProposalMin: 1000,
    voteProposalMax: 100
}


/*
    #Simplest use case
    -Validate all data is correct
    -Create a new project using the 'creator' address
    -Validate the project is created and the data is correct
    -Create a new proposal using the 'creator' address
    -Validate proposal is created  and data is correct
    -Creator votes to aprove proposal
    -Validate vote is registred
    -Creator resolves proposal
    -Validate proposal is resolved
    -Create a new proposal using the 'creator' address
    -Creator votes to denny proposal
    -Validate vote is registred
    -Creator resolves proposal
    -Validate proposal is resolved
*/

const addressBook=
{
    PROJECT_CREATOR:0,
    CONTRIBUTOR1: 1,
    CONTRIBUTOR2: 2,
    CONTRIBUTOR3: 3,
    RANDOM_USER:9 //Never writes (only calls, no transfers)
}


contract('Uumm', async function(accounts)
{

    getAddress=(index)=>
    {
        return accounts[index]
    }

    getAddress(addressBook.PROJECT_CREATOR)

    let uummInstance = await  Uumm.deployed()


    it("...validate initial state data", async function()
    {
 
        //ProjectLength
        let projectsLength = await uummInstance.GetProjectsLength.call(getAddress(addressBook.RANDOM_USER), {from: getAddress(addressBook.RANDOM_USER)})
        assert.equal (projectsLength.toNumber(), initialSateResults.projectsLength, "No project should exist yet")

        // project Id
        uummInstance.GetProjectIdByIndex.call(getAddress(addressBook.RANDOM_USER), 0, {from: getAddress(addressBook.RANDOM_USER)})
        .then(assert.fail)
         .catch(function(error) {
                assert(
                    error.message.indexOf(errors.InvalidOpcode) !== -1,
                    'No project should exist yet: It should throw: '+errors.InvalidOpcode
                )
         })

        //ProposalLength
        let proposalsLength = await uummInstance.GetProposalsLength.call(nonexistentArguments.ProjectId, {from: getAddress(addressBook.RANDOM_USER)})
        assert.equal (proposalsLength.toNumber(), initialSateResults.proposalsLength, "No proposal should exist yet") 

        //PendingProposalLength
        let pendingProposalsLength = await uummInstance.GetPendingProposalsLength.call(nonexistentArguments.ProjectId, {from: getAddress(addressBook.RANDOM_USER)})
        assert.equal (pendingProposalsLength.toNumber(), initialSateResults.pendingProposalsLength, "No pending proposal should exist yet")

        //ProposalDetails
        uummInstance.GetProposalDetails.call(nonexistentArguments.ProjectId, nonexistentArguments.ProposalId, {from: getAddress(addressBook.RANDOM_USER)})
        .then(assert.fail)
        .catch(function(error) {
                assert(
                    error.message.indexOf(errors.InvalidOpcode) !== -1,
                    'No proposal exists yet: It should throw: '+errors.InvalidOpcode
                )
         })

        //ProposalState
        uummInstance.GetProposalState.call(nonexistentArguments.ProjectId, nonexistentArguments.ProposalId, {from: getAddress(addressBook.RANDOM_USER)})
        .then(assert.fail)
        .catch(function(error) {
                assert(
                    error.message.indexOf(errors.InvalidOpcode) !== -1,
                    'No proposal exists yet: It should throw: '+errors.InvalidOpcode
                )
         })


        //Pending proposal Id
        uummInstance.GetPendingProposalId.call(nonexistentArguments.ProjectId, nonexistentArguments.PendingProposalIndex, {from: getAddress(addressBook.RANDOM_USER)})
        .then(assert.fail)
        .catch(function(error) {
                assert(
                    error.message.indexOf(errors.InvalidOpcode) !== -1,
                    'No proposal exists yet: It should throw: '+errors.InvalidOpcode
                )
         })

        //TODO
        //GetContributorData
        //GetContributorsLength
        //GetContributorProposalsLength
    })

    //TODO: We should be able to get the generated projectId on the frontend
    let project1Id 
    it("...should create a new project", async function() {
        await uummInstance.CreateProject(firstProject.name, {from: getAddress(addressBook.PROJECT_CREATOR)})
        let numberOfProjects = await uummInstance.GetProjectsLength.call(getAddress(addressBook.PROJECT_CREATOR) , {from: getAddress(addressBook.RANDOM_USER)})
        assert.equal(numberOfProjects.toNumber(), firstProject.projectsLength, "One single project should exist")
    }) 

    it("...get the project id", async function() {
        project1Id = await uummInstance.GetProjectId(getAddress(addressBook.PROJECT_CREATOR), 0, {from: getAddress(addressBook.RANDOM_USER)})
        //TODO: Check the hash
        assert.isOk(project1Id,"should be a sha3 of the project creator address + a nonce")
    })

    ////ProposalState #0
    it("...project creator creates a new proposal", async function() {

        Data.proposal1.creationTimestamp = Date.now()/1000
        Data.proposal1.author = getAddress(addressBook.PROJECT_CREATOR)

        let transaction = await uummInstance.CreateProposal(project1Id, firstProposal.title, firstProposal.reference, firstProposal.valueAmount,  {from: getAddress(addressBook.PROJECT_CREATOR)})
        validateGasUsed ("CreateProposal", transaction.receipt.gasUsed, 250000)

        let proposalDetails = await uummInstance.GetProposalDetails.call(project1Id, 0, {from: getAddress(addressBook.RANDOM_USER)})
        let id = proposalDetails[0].toNumber()
        let author = proposalDetails[1]
        let title = proposalDetails[2]
        let reference = proposalDetails[3]
        let valueAmount = proposalDetails[4].toNumber()
        let creationTimestamp = proposalDetails[5].toNumber()

        assert.equal(id, Data.proposal1.id, "Id of first proposal should be zero")
        assert.equal(author, Data.proposal1.author, "Author should be equal to the creator of the proposal")
        assert.equal(title, Data.proposal1.title, "Title doesn't match")
        assert.equal(valueAmount, Data.proposal1.valueAmount, "Value amount should match")
        assert.isAbove(creationTimestamp, Data.proposal1.creationTimestamp - 60, "Creation timestamp should more or less match current timestamp")
        assert.isBelow(creationTimestamp, Data.proposal1.creationTimestamp + 60, "Creation timestamp should more or less match current timestamp")

        await validateProposalState(uummInstance, getAddress(addressBook.PROJECT_CREATOR), project1Id, Data.proposal1, 0)
    })

    it("...one proposal should exist", async function() {
        let proposalsLength = await uummInstance.GetProposalsLength.call(project1Id, {from: getAddress(addressBook.RANDOM_USER)})
        assert.equal(proposalsLength.toNumber(), 1 ,"one proposal should be created")
    })

    //ProposalState #1
    it("...vote in favor of existing proposal", async function() {
        let transaction = await uummInstance.VoteProposal(project1Id, Data.proposal1.id, true, {from: getAddress(addressBook.PROJECT_CREATOR)})
        validateGasUsed ("VoteProposal", transaction.receipt.gasUsed, 70000)
        await validateProposalState(uummInstance, getAddress(addressBook.PROJECT_CREATOR), project1Id, Data.proposal1, 1)
    })
    //ProposalState #2 (idem)
    it("...voting again should not make a difference ", async function() {      
        let transaction = await uummInstance.VoteProposal(project1Id, Data.proposal1.id, true, {from: getAddress(addressBook.PROJECT_CREATOR)})
        validateGasUsed ("VoteProposal", transaction.receipt.gasUsed, 70000)
        await validateProposalState(uummInstance, getAddress(addressBook.PROJECT_CREATOR), project1Id, Data.proposal1, 2)
        
    })
    //ProposalState #3
    it("...voting again against it, should change the vote", async function() {      
        let transaction = await uummInstance.VoteProposal(project1Id, Data.proposal1.id, false, {from: getAddress(addressBook.PROJECT_CREATOR)})
        validateGasUsed ("VoteProposal", transaction.receipt.gasUsed, 70000)
        await validateProposalState(uummInstance, getAddress(addressBook.PROJECT_CREATOR), project1Id, Data.proposal1, 3)  
    })
    //ProposalState #4
    it("...voting again in favor, should change the vote back", async function() {      
        let transaction = await uummInstance.VoteProposal(project1Id, Data.proposal1.id, true, {from: getAddress(addressBook.PROJECT_CREATOR)})
        validateGasUsed ("VoteProposal", transaction.receipt.gasUsed, 70000)
        await validateProposalState(uummInstance, getAddress(addressBook.PROJECT_CREATOR), project1Id, Data.proposal1, 4)  
    })
})

async function validateProposalState (contract, fromAddress, projectId, expectedProposalData, stateIndex)
{
    let proposalState = await contract.GetProposalState(projectId, expectedProposalData.id, {from: fromAddress})
    
    let id = proposalState[0].toNumber()
    let state = proposalState[1].toNumber()
    let positiveVotes = proposalState[2].toNumber()
    let negativeVotes = proposalState[3].toNumber()
    let creationTimestamp = proposalState[4].toNumber()
    let totalSupply = proposalState[5].toNumber()

    assert.equal(id, expectedProposalData.id, "Id not matching")
    assert.equal(state, expectedProposalData.stateData[stateIndex].state, "State not matching")
    assert.equal(positiveVotes, expectedProposalData.stateData[stateIndex].positiveVotes, "Positive votes not matching")
    assert.equal(negativeVotes, expectedProposalData.stateData[stateIndex].negativeVotes, "Negative votes not matching")

    assert.isAbove(creationTimestamp, expectedProposalData.creationTimestamp - 60, "Creation timestamp should more or less match current timestamp")
    assert.isBelow(creationTimestamp, expectedProposalData.creationTimestamp + 60, "Creation timestamp should more or less match current timestamp")

    assert.equal(totalSupply, expectedProposalData.stateData[stateIndex].totalSupply, "TotalSupply not matching")
}

async function validateContributorVote(contract, fromAddress, projectId, expectedProposalData, index)
{
    let vote = await contract.GetContributorVote(projectId, expectedProposalData, 1, {from: fromAddress})
}

async function validateGasUsed(functionName, used, expectedMax = 10000, expectedMin = 0)
{
    logGas(functionName,used)
    assert.isAbove(used, expectedMin, "Not enough gas was used")
    assert.isBelow(used, expectedMax, "To much gas was used")
}

function logGas(functionName, usedGas)
{
    let gasPriceInGwei = 4
    let etherToUsd = 300     
    let gweiToEther = 1/1000000000
    let usdPrice = usedGas * gasPriceInGwei * gweiToEther * etherToUsd
    let usdPriceFormatted = Numeral(usdPrice).format('$0,0.000')

    let blue = "\x1b[33m"

    console.log(blue, "      Gas used by  "+functionName+ ": "+usedGas+" ("+usdPriceFormatted+")")
}