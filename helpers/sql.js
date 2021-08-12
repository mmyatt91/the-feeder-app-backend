const { BadRequestError } = require('../expressError');

/** Helper for making specific updates to queries. */

/**
 * Calling function can use this helper function to create the SET clause of a
 * SQL UPDATE statement.
 * 
 * @param dataToUpdate {Object} Ex: {field1: val1, field2: val2}
 * @param jsToSql {Object} maps js-style data fields to column names 
 * Ex: {username: "user_name", password: "password"}
 * 
 * @returns {Object} {sqlSetCols, dataToUpdate}
 * 
 * @example {username: "Mars123", password: "menarefrom"} =>
 * {setCols: '"user_name"=$1, "password"=$2',
 *            values: ['Mars123', 'menarefrom'] }
 */

function sqlForSpecificUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);

  if(keys.length === 0) throw new BadRequestError("No data.");

  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate)
  };
}

module.exports = { sqlForSpecificUpdate }