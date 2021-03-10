import React, {useEffect, useState, useRef} from 'react'
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Dropdown,
    DropdownButton,
} from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import {Typeahead, withAsync} from 'react-bootstrap-typeahead'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import api from '../services/api'

import '../styles/style.css'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'

const AsyncTypeahead = withAsync(Typeahead)

export default function Home() {
    const [text, setText] = useState('')
    const [products, setProducts] = useState('')
    const [suggestions, setSuggestions] = useState('')
    const [selectedSuggestion, setSelectedSuggestion] = useState('')
    const typeaheadRef = useRef(null)

    useEffect(() => {
        if (selectedSuggestion.length > 0) {
            setText(selectedSuggestion[0].term)
        }
    }, [selectedSuggestion])

    async function fetchSearchedProducts() {
        try {
            if (text && text.length >= 3) {
                text.toLocaleLowerCase()
                const response = await api.get(`${text}&source=nanook`)
                setProducts(formatProductList(response.data.products))
            } else {
                toast.warn('A busca deve conter mais de 3 caracteres')
            }
        } catch (err) {
            toast.warn('Não foi possível carregar a lista de produtos')
        }
    }

    const formatProductList = (unformatedList) => {
        let formatedList = unformatedList.map((p) => {
            const formatedProducts = {
                id: p.id,
                name: p.name,
                score: p._meta.score,
                visitsClickCount: p._meta.visitsClickCount,
            }
            return formatedProducts
        })
        return orderByScore(formatedList)
    }

    async function fetchSuggestedProducts(inputValue) {
        try {
            inputValue.toLocaleLowerCase()
            const response = await api.get(`${inputValue}&source=nanook`)
            const orderedSuggestionList = response.data.suggestions.sort(
                (a, b) => a.term.localeCompare(b.term)
            )
            setSuggestions(orderedSuggestionList)
        } catch (err) {
            console.error(err)
        }
    }

    const orderByScore = (unorderedList) => {
        const orderedList = unorderedList.sort((a, b) => {
            return b.score - a.score
        })
        return orderedList
    }

    const filterByVisitsClick = () => {
        let filterByVisitsClickList = products
        filterByVisitsClickList.sort((a, b) => {
            return b.visitsClickCount - a.visitsClickCount
        })
        setProducts(filterByVisitsClickList)
    }

    const filterByScore = () => {
        let filterByScore = products
        filterByScore.sort((a, b) => {
            return b.score - a.score
        })
        setProducts(filterByScore)
    }

    const handleSuggestedSearch = (value) => {
        fetchSuggestedProducts(value)
        setText(value)
    }

    const handleSearch = () => {
        fetchSearchedProducts()
        if (typeaheadRef.current !== null) {
            typeaheadRef.current.clear()
            setSelectedSuggestion('')
        }
    }

    const filterBy = () => true

    return (
        <div className='homeContainer'>
            <Container>
                <Row className='searchRow'>
                    <Col xs={12} sm={8}>
                        <Form.Group>
                            <AsyncTypeahead
                                filterBy={filterBy}
                                id='searchProductsInput'
                                labelKey='term'
                                options={Array.from(suggestions)}
                                inputValue={text}
                                onInputChange={(value) =>
                                    handleSuggestedSearch(value)
                                }
                                onChange={setSelectedSuggestion}
                                selected={selectedSuggestion}
                                renderMenuItemChildren={(option, props) => (
                                    <div className='suggestionsList'>
                                        {option.term}
                                    </div>
                                )}
                                onKeyDown={(e) => {
                                    if (e.keyCode === 13) {
                                        fetchSearchedProducts()
                                        typeaheadRef.current.clear()
                                        setSelectedSuggestion('')
                                        setText('')
                                    }
                                }}
                                ref={typeaheadRef}
                                placeholder='Buscar produtos...'
                                promptText={'Digite para buscar'}
                                emptyLabel={
                                    'Nenhuma correspondência encontrada'
                                }
                            />
                        </Form.Group>
                    </Col>
                    <Col className='buttonCol' xs={12} sm={4} md={2}>
                        <Button
                            className='searchButton'
                            onClick={() => handleSearch()}
                        >
                            Buscar
                        </Button>
                        <ToastContainer />
                    </Col>
                    <Col className='filterCol' xs={12} sm={12} md={2}>
                        <DropdownButton
                            id='dropdown-basic-button'
                            title='Filtrar: '
                            className='filterButton'
                        >
                            <Dropdown.Item
                                href='#/action-1'
                                onSelect={filterByVisitsClick}
                            >
                                Mais procurados
                            </Dropdown.Item>
                            <Dropdown.Item
                                href='#/action-2'
                                onSelect={filterByScore}
                            >
                                Melhor avaliados
                            </Dropdown.Item>
                        </DropdownButton>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12} className='customTable'>
                        <BootstrapTable
                            bootstrap4
                            striped
                            hover
                            condensed
                            type='text'
                            placeholder='Digite o nome do produto'
                            keyField='id'
                            data={products}
                            columns={[
                                {
                                    dataField: 'name',
                                    text: 'Produto',
                                    headerClasses: 'productsColumn',
                                },
                            ]}
                            noDataIndication='Nenhuma informação encontrada'
                        ></BootstrapTable>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
