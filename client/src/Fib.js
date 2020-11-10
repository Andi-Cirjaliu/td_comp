import React, { Component } from "react";
import axios from "axios";

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: [],
    index: "",
  };

  fetchValues = async () => {
    const values = await axios.get("/api/values/current");
    console.log('Fetch values returned: ', values.data);
    this.setState({ values: values.data });
  };

  fetchIndexes = async () => {
    const indexes = await axios.get("/api/values/all");
    console.log('Fetch indexes returned: ', indexes.data);
    this.setState({ seenIndexes: indexes.data });
  };

  componentDidMount = () => {
    this.fetchValues();
    this.fetchIndexes();
  };

  renderSeenIndexes = () => {
    return this.state.seenIndexes.map((number) => number.number).join(", ");
  };

  renderValues = () => {
    const entries = [];

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {this.state.values[key]}
        </div>
      );
    }

    return entries;
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    await axios.post("/api/values", {
      index: this.state.index,
    });

    this.setState({ index: "" });
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index</label>
          <input
            value={this.state.index}
            onChange={(event) => this.setState({ index: event.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated values</h3>
        {this.renderValues()}
      </div>
    );
  }
}

export default Fib;
