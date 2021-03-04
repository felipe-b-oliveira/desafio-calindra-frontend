import React, {useEffect, useState, useRef} from 'react'
import {Container, Row, Col, Form, Button} from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import {Typeahead, withAsync} from 'react-bootstrap-typeahead'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import api from '../services/api'

import '../styles/style.css'

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
        let teste = unformatedList.map((p) => {
            const formatedProducts = {
                id: p.id,
                name: p.name,
                visitsClickCount: p._meta.visitsClickCount,
            }
            return formatedProducts
        })
        return orderByVisitsClickCount(teste)
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

    const orderByVisitsClickCount = (unorderedList) => {
        const orderedList = unorderedList.sort((a, b) => {
            return b.visitsClickCount - a.visitsClickCount
        })
        return orderedList
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
                    <Col xs={12} sm={10}>
                        <Form.Group>
                            <AsyncTypeahead
                                filterBy={filterBy}
                                id='searchProductsInput'
                                labelKey='term'
                                onSearch={handleSuggestedSearch}
                                options={Array.from(suggestions)}
                                placeholder='Buscar produtos...'
                                onChange={setSelectedSuggestion}
                                selected={selectedSuggestion}
                                renderMenuItemChildren={(option, props) => (
                                    <div className='suggestionsList'>
                                        {option.term}
                                    </div>
                                )}
                                promptText={'Digite para buscar'}
                                emptyLabel={
                                    'Nenhuma correspondência encontrada'
                                }
                                onKeyDown={(e) => {
                                    if (e.keyCode === 13) {
                                        fetchSearchedProducts()
                                    }
                                }}
                                ref={typeaheadRef}
                            />
                        </Form.Group>
                    </Col>
                    <Col className='buttonCol' xs={12} sm={2}>
                        <Button
                            className='searchButton'
                            onClick={() => handleSearch()}
                        >
                            Buscar
                        </Button>
                        <ToastContainer />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12} className='customTable'>
                        <BootstrapTable
                            striped
                            hover
                            condensed
                            type='text'
                            placeholder='Digite o nome do produto'
                            keyField='id'
                            data={products}
                            columns={[{dataField: 'name', text: 'Produto'}]}
                            noDataIndication='Nenhuma informação encontrada'
                        ></BootstrapTable>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
