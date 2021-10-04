
import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

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
                  {body.map(row => <TableRow row={row} onClick={this.props.onClick}/>)}
              </tbody>
          </table>
      );
  }
}

class TableRow extends Component {
  render() {
      var row = this.props.row;
      var onClick = this.props.onClick;
      return (
          <tr>
            <td>
              {row.name}
            </td>
            <td>
              {row.balance}
            </td>
            <td>
              <img src={row.icon} className="tokenLogo" alt=""></img>
            </td>
            <td>
              <Button disabled={row.approved} onClick={()=>onClick(row.address)}>
                  <span>
                    Approve
                  </span>
                </Button>
            </td>
          </tr>
      )
  }
}