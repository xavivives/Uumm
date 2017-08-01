import React from 'react'
import State from './State.js'
import Web3AutoSetup from './Web3AutoSetup.js'
import OwnershipChart from './OwnershipChart.js'
import Numeral from 'numeral'
import MarkdownLoader from './MarkdownLoader.js'
import Divider from 'material-ui/Divider';

const overflowStyle = {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden"
}

const subheaderStyle = {
    color:"grey",
    marginBottom:-10,
    marginTop:0
}

class ProjectDetails extends React.Component {

    constructor(props)
    {
        super()
        var address = process.env.PUBLIC_URL
    }

    getAddressStyle=(color)=>
    {
        var style = overflowStyle
        style.color = color
        return style
    }

    render()
    {
        var projectData = State.getEmptyProject()
        var contributorData = State.getEmptyContributor()
        if(State.data.projects[this.props.projectId])
            projectData = State.data.projects[this.props.projectId]

        if(projectData.contributors)
               if(projectData.contributors[Web3AutoSetup.currentAccount])
                    contributorData = projectData.contributors[Web3AutoSetup.currentAccount]

        var ownership = Numeral(contributorData.valueTokens/projectData.totalSupply).format('0.0%')

        return (
            <div>

               <div style={{display:"flex", flexDirection:"row"}}> 
                    <OwnershipChart
                        userTokens={contributorData.valueTokens}
                        totalSupply={projectData.totalSupply}
                        /> 

                    <div style={{display:"flex",flexDirection:"column", overflow: "hidden",  paddingLeft:10 }}>
                        <h5 style={subheaderStyle}>Project ID</h5>
                        <p style={overflowStyle}> {projectData.id} </p>
                        <h5 style={subheaderStyle}>Project total token supply</h5>
                        <p> {projectData.totalSupply} </p>
                        <h5 style={subheaderStyle}>Your address</h5>
                        <p style={this.getAddressStyle("#ff3366")}> {this.props.userAddress}</p>
                        <h5 style={subheaderStyle}>Your tokens</h5>
                        <p> {contributorData.valueTokens} </p>
                        <h5 style={subheaderStyle}>Available ethereum to withdraw</h5>
                        <p> {contributorData.ethereumBalance} ETH </p>

                    </div>
                    
                    <Divider/>


                </div>
           </div>
        )
    }
}

export default ProjectDetails