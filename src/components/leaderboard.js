const Leaderboard = ({ scores }) => {
   return (<div className="leaderboard">
      <h2>Leaderboard</h2>
      <table>
         <tbody>
            <tr>
               <th>Rank</th>
               <th>Name</th>
               <th>Score</th>
               <th>Time</th>
               <th>Level</th>
            </tr>
            {scores.map((score, i) =>
               <tr key={Math.random().toString()}>
                  <td>{i+1}</td>
                  <td>{score.username}</td>
                  <td>{score.score}</td>
                  <td>{score.time}</td>
                  <td>{score.level}</td>
               </tr>
            )}
         </tbody>
      </table>
   </div>
   );
}


export default Leaderboard;