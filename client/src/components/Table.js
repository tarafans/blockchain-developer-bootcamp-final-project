
import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

export const WALLET_VIEW = 'wallet_view'
export const NFT_VIEW = 'nft_view'

export class Table extends Component {
  render() {
      var heading = this.props.heading;
      var body = this.props.body;
      return (
          <table style={{ width: 500 }}>
              <thead>
                <tr>
                  {heading?.map(head => <th>{head}</th>)}
                </tr>
              </thead>
              <tbody>
                  {body.map(row => <TableRow 
                    row={row} 
                    approve={this.props.approve} 
                    deposit={this.props.deposit} 
                    withdraw={this.props.withdraw} 
                    view={this.props.view} 
                  />)}
              </tbody>
          </table>
      );
  }
}

class TableRow extends Component {
  render() {
      const row = this.props.row;
      const approve = this.props.approve;
      const deposit = this.props.deposit;
      const withdraw = this.props.withdraw;
      const view = this.props.view;
      return (
          <tr>
            <td>
              {row.name}
            </td>
            <td>
              { (view === WALLET_VIEW) ?
                  row.walletBalance
                :
                  row.nftBalance
              }
            </td>
            <td>
              <img src={row.icon} className="tokenLogo" alt=""></img>
            </td>
            { approve ?
              <td>
                <Button disabled={row.approved} onClick={()=>approve(row.address)}>
                  <span>
                    Approve
                  </span>
                </Button>
              </td> : <td></td>
            }
            { deposit ?
              <td>
                <Button disabled={!row.approved} onClick={()=>deposit(row.address)}>
                  <span>
                    Deposit
                  </span>
                </Button>
              </td> : <td></td>
            }
            { withdraw ?
              <td>
                <Button disabled={!row.approved} onClick={()=>withdraw(row.address)}>
                  <span>
                    Withdraw
                  </span>
                </Button>
              </td> : <td></td>
            }
          </tr>
      )
  }
}