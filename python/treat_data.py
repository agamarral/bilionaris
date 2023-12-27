import pandas as pd
import ast
import json
from enum import Enum

class BillCount:
    def __init__(self, year, qty):
        self.year = year
        self.qty = qty


class BillPerCountry(BillCount): 
    def __init__(self, country, year, qty):
        self.country= country
        super().__init__(year, qty)


class BillPerBusiness(BillCount):
    def __init__(self, business, year, qty):
        self.business = business
        super().__init__(year, qty)

class BillPerAgeRange(BillCount):

    def __init__(self, age_range, year, qty):
        self.age_range = age_range
        super().__init__(year, qty)

def get_age_range(row):
    if row['age'] == '':
        val = 'Unknown'
    if row['age'] <= 25:
        val = '< 25y'
    elif row['age'] <= 50:
        val = '25y - 50y'
    elif row['age'] <= 75:
        val = '50y - 75y'
    else:
        val = '> 75y'
    return val

if __name__=="__main__":

    bpc = dict() # billionaires per country
    bpb = dict() # billionaires per business
    bpa = dict() # billionaires per age range

    countries_df = pd.read_csv('assets/vendors/SVG-World-Map-master/src/country-data.csv', sep=';')


    df = pd.read_csv('assets/data/all_billionaires_1997_2023.csv')
    per_country = df.groupby(['year', 'country_of_citizenship']).size()
    for r in per_country.items():
        year = r[0][0]
        # get the country code in the countries dataframe
        country = countries_df.loc[countries_df['name'] == r[0][1]]['code'].to_list()[0]
        qty = r[1]
        if year in bpc.keys():
            bpc[year].append(BillPerCountry(country, year, qty))
        else:
            bpc[year] = [BillPerCountry(country, year, qty)]
    
    per_business = df.groupby(['year', 'business_industries']).size()
    for r in per_business.items():
        year = r[0][0]
        business = ast.literal_eval(r[0][1])[0].strip()
        qty = r[1]

        if year in bpb.keys():
            bpb[year].append(BillPerBusiness(business, year, qty))
        else:
            bpb[year] = [BillPerBusiness(business, year, qty)]

        

    #create new column 'age_range'
    df['age_range'] = df.apply(get_age_range, axis=1)
    per_age = df.groupby(['year', 'age_range']).size()
    # last_year = ''
    # list_ranges = ['Unknown', '< 25y', '25y - 50y', '50y - 75y', '> 75y']
    
    for r in per_age.items():
        year = r[0][0]
        age_range = r[0][1]
        qty = r[1]
        if year in bpa.keys():
            bpa[year].append(BillPerAgeRange(age_range, year, qty))
        else:
            # if last_year != '':
            #     # adds a sample with qty = 0 for the age range not represented
            #     # don't run it in the first loop
            #     for r in list_ranges:
            #         bpa[last_year].append(BillPerAgeRange(r, last_year, 0))

            # list_ranges = ['Unknown', '< 25y', '25y - 50y', '50y - 75y', '> 75y']
            # starting samples for new year, initializes the control list
            bpa[year] = [BillPerAgeRange(age_range, year, qty)]
        # removes the age range from the control list
        # list_ranges.remove(age_range)
        # last_year = year

    with open('billionaires_per_country.json', 'w', encoding='utf-8') as f:
        data = json.dumps(bpc, default = lambda x: x.__dict__)
        json.dump(data, f, ensure_ascii=False, indent=4)
        f.close() 
    with open('billionaires_per_business.json', 'w', encoding='utf-8') as f:
        data = json.dumps(bpb, default = lambda x: x.__dict__)
        json.dump(data, f, ensure_ascii=False, indent=4)
        f.close()
    with open('billionaires_per_age.json', 'w', encoding='utf-8') as f:    
        data = json.dumps(bpa, default = lambda x: x.__dict__)
        json.dump(data, f, ensure_ascii=False, indent=4)
        f.close()          

        