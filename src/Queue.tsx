import { queue } from "./util/db";

function Queue() {
  return (
    <div
      style={`
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        width: 100%;
        height: 100%;
        overflow: auto;
      `}
    >
      <table
        style={`
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        `}
      >
        <thead>
          <tr>
            <th style="text-align: left; width: 30%;">Track</th>
            <th style="text-align: left; width: 70%;">Name</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((item) => (
            <tr>
              <td
                style={`
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                `}
              >
                {item.track}
              </td>
              <td
                style={`
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                `}
              >
                {item.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Queue;