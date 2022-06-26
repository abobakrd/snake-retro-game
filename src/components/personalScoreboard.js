const PersonalScoreBoard = ({scores}) => {
   
   function Scores() {
      return (
         <table>
            <tbody>
               <tr>
                  <th>Rank</th>
                  <th>Score</th>
                  <th>Time</th>
                  <th>Level</th>
               </tr>
               {scores.map((score, i) =>
                  <tr key={Math.random().toString()}>
                     <td>{i+1}</td>
                     <td>{score.score}</td>
                     <td>{score.time}</td>
                     <td>{score.level}</td>
                  </tr>
               )}
            </tbody>
         </table>
      );
   }
   return (
      <div className="personal-score-board">
         <h2>Personal Score Board</h2>
         {scores.length > 0 ? <Scores /> : <h2>No scores yet</h2>}
      </div>
   );
}

export default PersonalScoreBoard;