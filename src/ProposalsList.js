import React from 'react';
import ProposalCard from './ProposalCard';
import UnconfirmedProposalCard from './UnconfirmedProposalCard';
import Uumm from './UummContractInterface.js'
import State from './State.js'

class ProposalsList extends React.Component
{
    constructor(props)
    {
        super();
        this.state = {};
        Uumm.isReady().then(()=>{
            Uumm.getProposals(props.projectId)
        })
    }

    onPositiveVote = (proposalData)=>
    {
         Uumm.voteProposal(this.props.projectId, proposalData.id, true)
    }
    
    onNegativeVote = (proposalData)=>
    {
        Uumm.voteProposal(this.props.projectId, proposalData.id, false)
    }

    onResolve = (proposalData)=>
    {
        Uumm.resolveProposal(this.props.projectId, proposalData.id)
    }
  
    render()
    {
        var projectData = State.getEmptyProject()
        
        if(State.data.projects[this.props.projectId])
            projectData = State.data.projects[this.props.projectId]

        var proposalsComponents = [];

        if(projectData.proposals)
        {

            for (var proposalId in projectData.proposals) 
            {
                if (!projectData.proposals.hasOwnProperty(proposalId))
                    continue

                var proposalData = State.getEmptyProposal()

                if(projectData.proposals[proposalId])
                    proposalData = projectData.proposals[proposalId] 

                proposalsComponents.push(
                    <ProposalCard
                        key={proposalData.id}
                        projectId={this.props.projectId}
                        proposalData={proposalData}
                        projectData={projectData}
                        onPositiveVote={this.onPositiveVote}
                        onNegativeVote={this.onNegativeVote}
                        onResolve={this.onResolve}
                    />);
            }
        }

        if(projectData.unconfirmedProposals)
        {
            for (var unconfirmedProposalId in projectData.unconfirmedProposals)
            {
                if (!projectData.unconfirmedProposals.hasOwnProperty(unconfirmedProposalId))
                    continue

                var unconfirmedProposalData = State.getEmptyProposal()

                if(projectData.unconfirmedProposals[unconfirmedProposalId])
                    unconfirmedProposalData = projectData.unconfirmedProposals[unconfirmedProposalId] 

                proposalsComponents.push(
                    <UnconfirmedProposalCard
                        key={"u"+unconfirmedProposalId}
                        projectId={this.props.projectId}
                        proposalData={unconfirmedProposalData}
                        projectData={projectData}
                    />);
            }
        }

        return (
          <div>
                {proposalsComponents}    
          </div>
        );
    }
}

export default ProposalsList;