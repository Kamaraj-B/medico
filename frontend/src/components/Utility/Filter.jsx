

const Filter = ({ filter, setFilter }) =>{
    const handleChange = (event) => {
        setFilter(event.target.value);
    };
    
    return (
        <div>
        <label htmlFor="filter">Filter:</label>
        <select id="filter" value={filter} onChange={handleChange}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
        </select>
        </div>
    );
};

export default Filter