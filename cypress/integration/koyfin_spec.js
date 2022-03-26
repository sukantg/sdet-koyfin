describe('On logging into Koyfin', () => {
  beforeEach(() => {
    cy.intercept('POST','https://api.koyfin.com/api/v3/data/graph').as('getData')
    cy.visit('https://www.koyfin.com/')
    cy.contains('Log In').click();
    cy.get('input[name="email"]').type('sukant.ghosh@gmail.com');
    cy.get('input[name="password"]').type('test123').type("{enter}");
    cy.contains('Graphs').click();
    cy.contains('Historical Graph').click();
    cy.contains('Graphs').click();
})
  it('the max and min close data gets displayed ', () => {
      
    cy.wait('@getData').then(({response}) => {
      // Checking that the call went through
      expect(response.statusCode).to.eq(200)
     

      // Collecting graph data for selected period
      var graph_data = {};
      
      for (var i = 0; i < response.body.graph.length; i++) {
        graph_data[response.body.graph[i].close] = response.body.graph[i].date ;
      }

      // Collecting max and min close price
      const keys = Object.keys(graph_data);
      const max_key = Math.max(...keys);
      const min_key = Math.min(...keys);
      

      const max_min = {
        maxPrice: {date: graph_data[max_key], value: max_key},
        minPrice: {date: graph_data[min_key], value: min_key}
      }
      // displays the max/min on standard output
      cy.log('The MAX and MIN close value for the stock : ' + response.body.id);
      cy.log(max_min);
      
      // Verify that there was an official beginning/end period

      expect(response.body.startDate).to.not.null;
      expect(response.body.endDate).to.not.null;
    })
  })
  it ('check that koyfin does not vary more than 5% from polygon', () => {

    // Preparing Koyfin data
    cy.wait('@getData').then(({response}) => {
      expect(response.statusCode).to.eq(200)
    })

    // Preparing Polygon data
    var stock = '';
    cy.get('.quote-box__ticker___YsyTL').then(function($elem) {
       stock = $elem.text();    
       cy.request('https://api.polygon.io/v2/aggs/ticker/' + stock + '/range/1/day/2020-06-01/2020-06-17?apiKey=o_4ClAnd5TDsG8S7eHpuIvQGuL1b7V8v').then((resp) => {
         cy.log(resp.body);     
      })
    })

    /* Open Questions 

    What's OPEN/CLOSE price delta? 
    Is it the variation between Koyfin's average OPEN/CLOSE vs Polygon.io's average OPEN/CLOSE?
    
    This is specific to Polygon - 
    Are we comparing Polygon.io's 1 day latest stock OPEN/CLOSE vs Koyfin's average OPEN/CLOSE?
    Is the Polygon API providing the latest stock quote when called?

    */

    
  })
})